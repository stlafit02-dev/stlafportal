using Microsoft.EntityFrameworkCore;
using STLAF.Api.Common.Email;
using STLAF.Api.Common.Services;
using STLAF.Api.Data;
using STLAF.Api.Departments.HRAdmin.DTOs;
using STLAF.Api.Departments.HRAdmin.Entities;

namespace STLAF.Api.Departments.HRAdmin.Services;

public class OvertimeService : IOvertimeService
{
    private readonly AppDbContext _db;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _config;

    public OvertimeService(AppDbContext db, IEmailSender emailSender, IConfiguration config)
    {
        _db = db;
        _emailSender = emailSender;
        _config = config;
    }

    private string FrontendUrl(string path) => $"{_config["Frontend:BaseUrl"]?.TrimEnd('/')}{path}";

    // ---------- Partners ----------

    public async Task<List<OvertimePartnerDto>> GetPartnersAsync()
    {
        return await _db.OvertimePartners
            .Include(p => p.PartnerEmployee)
            .OrderBy(p => p.Department)
            .Select(p => new OvertimePartnerDto
            {
                Id = p.Id,
                Department = p.Department,
                PartnerEmployeeId = p.PartnerEmployeeId,
                PartnerName = p.PartnerEmployee.FirstName + " " + p.PartnerEmployee.LastName
            })
            .ToListAsync();
    }

    public async Task<OvertimePartnerDto> SetPartnerAsync(SetOvertimePartnerDto dto)
    {
        var existing = await _db.OvertimePartners.FirstOrDefaultAsync(p => p.Department == dto.Department);

        if (existing is null)
        {
            existing = new OvertimePartner { Department = dto.Department, PartnerEmployeeId = dto.PartnerEmployeeId };
            _db.OvertimePartners.Add(existing);
        }
        else
        {
            existing.PartnerEmployeeId = dto.PartnerEmployeeId;
        }

        await _db.SaveChangesAsync();

        var employee = await _db.Employees.FirstAsync(e => e.Id == dto.PartnerEmployeeId);

        return new OvertimePartnerDto
        {
            Id = existing.Id,
            Department = existing.Department,
            PartnerEmployeeId = existing.PartnerEmployeeId,
            PartnerName = $"{employee.FirstName} {employee.LastName}"
        };
    }

    // ---------- Employee-facing ----------

    public async Task<List<OvertimeRequestDto>> GetMyRequestsAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return new List<OvertimeRequestDto>();

        var requests = await _db.OvertimeRequests
            .Include(r => r.Employee)
            .Include(r => r.DeptDecidedByEmployee)
            .Include(r => r.PartnerDecidedByEmployee)
            .Where(r => r.EmployeeId == employee.Id)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(ToDto).ToList();
    }

    public async Task<OvertimeRequestDto> CreateRequestAsync(Guid userId, CreateOvertimeRequestDto dto)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId)
            ?? throw new InvalidOperationException("No employee record linked to this account.");

        var start = TimeOnly.Parse(dto.StartTime);
        var end = TimeOnly.Parse(dto.EndTime);
        var hours = (end.ToTimeSpan() - start.ToTimeSpan()).TotalHours;
        if (hours <= 0) hours += 24;

        var request = new OvertimeRequest
        {
            EmployeeId = employee.Id,
            Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc),
            StartTime = start,
            EndTime = end,
            Hours = Math.Round(hours, 2),
            Reason = dto.Reason,
            Status = "Pending"
        };

        _db.OvertimeRequests.Add(request);
        await _db.SaveChangesAsync();

        await _db.Entry(request).Reference(r => r.Employee).LoadAsync();

        await NotifyDeptApproverAsync(request);

        return ToDto(request);
    }

    // ---------- Department head decision ----------

    public async Task<bool> IsDeptApproverAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return false;

        return await _db.LeaveApprovers.AnyAsync(a => a.ApproverEmployeeId == employee.Id);
    }

    public async Task<List<OvertimeRequestDto>> GetPendingDeptApprovalsAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return new List<OvertimeRequestDto>();

        var departments = await _db.LeaveApprovers
            .Where(a => a.ApproverEmployeeId == employee.Id)
            .Select(a => a.Department)
            .ToListAsync();

        if (departments.Count == 0) return new List<OvertimeRequestDto>();

        var requests = await _db.OvertimeRequests
            .Include(r => r.Employee)
            .Where(r => r.Status == "Pending" && departments.Contains(r.Employee.Department))
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(ToDto).ToList();
    }

    public async Task<OvertimeRequestDto?> DecideDeptAsync(Guid userId, Guid requestId, DecideOvertimeDto dto)
    {
        var deciderEmployee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (deciderEmployee is null) return null;

        var request = await _db.OvertimeRequests
            .Include(r => r.Employee)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request is null || request.Status != "Pending") return null;

        request.DeptDecidedByEmployeeId = deciderEmployee.Id;
        request.DeptDecisionNotes = dto.Notes;
        request.DeptDecidedAt = DateTime.UtcNow;

        if (dto.Approved)
        {
            request.Status = "PendingPartnerApproval";
            await _db.SaveChangesAsync();
            await _db.Entry(request).Reference(r => r.DeptDecidedByEmployee).LoadAsync();
            await NotifyPartnerAsync(request);
        }
        else
        {
            request.Status = "Rejected";
            await _db.SaveChangesAsync();
            await _db.Entry(request).Reference(r => r.DeptDecidedByEmployee).LoadAsync();
            await NotifyEmployeeOfFinalDecisionAsync(request);
        }

        return ToDto(request);
    }

    // ---------- Partner (final) decision ----------

    public async Task<bool> IsPartnerAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return false;

        return await _db.OvertimePartners.AnyAsync(p => p.PartnerEmployeeId == employee.Id);
    }

    public async Task<List<OvertimeRequestDto>> GetPendingPartnerApprovalsAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return new List<OvertimeRequestDto>();

        var departments = await _db.OvertimePartners
            .Where(p => p.PartnerEmployeeId == employee.Id)
            .Select(p => p.Department)
            .ToListAsync();

        if (departments.Count == 0) return new List<OvertimeRequestDto>();

        var requests = await _db.OvertimeRequests
            .Include(r => r.Employee)
            .Where(r => r.Status == "PendingPartnerApproval" && departments.Contains(r.Employee.Department))
            .OrderBy(r => r.DeptDecidedAt)
            .ToListAsync();

        return requests.Select(ToDto).ToList();
    }

    public async Task<OvertimeRequestDto?> DecidePartnerAsync(Guid userId, Guid requestId, DecideOvertimeDto dto)
    {
        var partnerEmployee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (partnerEmployee is null) return null;

        var request = await _db.OvertimeRequests
            .Include(r => r.Employee)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request is null || request.Status != "PendingPartnerApproval") return null;

        request.Status = dto.Approved ? "Approved" : "Rejected";
        request.PartnerDecidedByEmployeeId = partnerEmployee.Id;
        request.PartnerDecisionNotes = dto.Notes;
        request.PartnerDecidedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _db.Entry(request).Reference(r => r.PartnerDecidedByEmployee).LoadAsync();

        await NotifyEmployeeOfFinalDecisionAsync(request);

        return ToDto(request);
    }

    // ---------- Notifications ----------

    private async Task NotifyDeptApproverAsync(OvertimeRequest request)
    {
        var approverLink = await _db.LeaveApprovers
            .Include(a => a.ApproverEmployee)
            .FirstOrDefaultAsync(a => a.Department == request.Employee.Department);
        if (approverLink is null) return;

        var email = approverLink.ApproverEmployee.CompanyEmail ?? approverLink.ApproverEmployee.PersonalEmail;
        if (string.IsNullOrWhiteSpace(email)) return;

        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var subject = $"New Overtime Request - {request.Employee.FirstName} {request.Employee.LastName}";
        var bodyHtml = EmailTemplateBuilder.InfoRow("Employee", $"{request.Employee.FirstName} {request.Employee.LastName} ({request.Employee.Department})")
            + EmailTemplateBuilder.InfoRow("Date", $"{request.Date:MMM d, yyyy}, {request.StartTime:h:mm tt} - {request.EndTime:h:mm tt} ({request.Hours} hour(s))")
            + EmailTemplateBuilder.InfoRow("Reason", request.Reason);

        var html = EmailTemplateBuilder.Build("New Overtime Request", bodyHtml, "Review Request", FrontendUrl("/dashboard/leave/approvals"));

        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, email, subject, html);
    }

    private async Task NotifyPartnerAsync(OvertimeRequest request)
    {
        var partnerLink = await _db.OvertimePartners
            .Include(p => p.PartnerEmployee)
            .FirstOrDefaultAsync(p => p.Department == request.Employee.Department);
        if (partnerLink is null) return;

        var email = partnerLink.PartnerEmployee.CompanyEmail ?? partnerLink.PartnerEmployee.PersonalEmail;
        if (string.IsNullOrWhiteSpace(email)) return;

        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var subject = $"Overtime Request Needs Final Approval - {request.Employee.FirstName} {request.Employee.LastName}";
        var bodyHtml = EmailTemplateBuilder.InfoRow("Employee", $"{request.Employee.FirstName} {request.Employee.LastName} ({request.Employee.Department})")
            + EmailTemplateBuilder.InfoRow("Date", $"{request.Date:MMM d, yyyy}, {request.StartTime:h:mm tt} - {request.EndTime:h:mm tt} ({request.Hours} hour(s))")
            + $@"<p style=""margin:12px 0 4px;"">Approved by the department head. This needs your final decision.</p>"
            + EmailTemplateBuilder.InfoRow("Reason", request.Reason);

        var html = EmailTemplateBuilder.Build("Overtime Needs Final Approval", bodyHtml, "Review Request", FrontendUrl("/dashboard/leave/final-approvals"));

        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, email, subject, html);
    }

    private async Task NotifyEmployeeOfFinalDecisionAsync(OvertimeRequest request)
    {
        var email = request.Employee.CompanyEmail ?? request.Employee.PersonalEmail;
        if (string.IsNullOrWhiteSpace(email)) return;

        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var subject = $"Overtime Request {request.Status} - {request.Date:MMM d, yyyy}";
        var notes = request.Status == "Rejected" && request.PartnerDecidedAt is null
            ? request.DeptDecisionNotes
            : request.PartnerDecisionNotes;
        var bodyHtml = EmailTemplateBuilder.InfoRow("Date", $"{request.Date:MMM d, yyyy}, {request.StartTime:h:mm tt} - {request.EndTime:h:mm tt} ({request.Hours} hour(s))")
            + EmailTemplateBuilder.InfoRow("Status", request.Status)
            + (string.IsNullOrWhiteSpace(notes) ? "" : EmailTemplateBuilder.InfoRow("Notes", notes));

        var html = EmailTemplateBuilder.Build($"Overtime Request {request.Status}", bodyHtml, "View My Overtime", FrontendUrl("/dashboard/leave/overtime"));

        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, email, subject, html);
    }

    private static OvertimeRequestDto ToDto(OvertimeRequest r) => new()
    {
        Id = r.Id,
        EmployeeId = r.EmployeeId,
        EmployeeName = $"{r.Employee.FirstName} {r.Employee.LastName}",
        Department = r.Employee.Department,
        Date = r.Date,
        StartTime = r.StartTime.ToString("HH:mm"),
        EndTime = r.EndTime.ToString("HH:mm"),
        Hours = r.Hours,
        Reason = r.Reason,
        Status = r.Status,
        DeptDecidedByName = r.DeptDecidedByEmployee is null ? null : $"{r.DeptDecidedByEmployee.FirstName} {r.DeptDecidedByEmployee.LastName}",
        DeptDecisionNotes = r.DeptDecisionNotes,
        DeptDecidedAt = r.DeptDecidedAt,
        PartnerDecidedByName = r.PartnerDecidedByEmployee is null ? null : $"{r.PartnerDecidedByEmployee.FirstName} {r.PartnerDecidedByEmployee.LastName}",
        PartnerDecisionNotes = r.PartnerDecisionNotes,
        PartnerDecidedAt = r.PartnerDecidedAt,
        CreatedAt = r.CreatedAt
    };
}