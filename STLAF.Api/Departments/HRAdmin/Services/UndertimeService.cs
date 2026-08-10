using Microsoft.EntityFrameworkCore;
using STLAF.Api.Common.Email;
using STLAF.Api.Common.Services;
using STLAF.Api.Data;
using STLAF.Api.Departments.HRAdmin.DTOs;
using STLAF.Api.Departments.HRAdmin.Entities;

namespace STLAF.Api.Departments.HRAdmin.Services;

public class UndertimeService : IUndertimeService
{
    private readonly AppDbContext _db;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _config;

    public UndertimeService(AppDbContext db, IEmailSender emailSender, IConfiguration config)
    {
        _db = db;
        _emailSender = emailSender;
        _config = config;
    }

    private string FrontendUrl(string path) => $"{_config["Frontend:BaseUrl"]?.TrimEnd('/')}{path}";

    private static string DepartmentSlug(string department) =>
        department == "HRAdmin" ? "hr-admin" : department.ToLowerInvariant();

    public async Task<List<UndertimeRequestDto>> GetMyRequestsAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return new List<UndertimeRequestDto>();

        var requests = await _db.UndertimeRequests
            .Include(r => r.Employee)
            .Include(r => r.DecidedByEmployee)
            .Where(r => r.EmployeeId == employee.Id)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(ToDto).ToList();
    }

    public async Task<UndertimeRequestDto> CreateRequestAsync(Guid userId, CreateUndertimeRequestDto dto)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId)
            ?? throw new InvalidOperationException("No employee record linked to this account.");

        var start = TimeOnly.Parse(dto.StartTime);
        var end = TimeOnly.Parse(dto.EndTime);
        var hours = (end.ToTimeSpan() - start.ToTimeSpan()).TotalHours;
        if (hours <= 0) hours += 24;

        var request = new UndertimeRequest
        {
            EmployeeId = employee.Id,
            Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc),
            StartTime = start,
            EndTime = end,
            Hours = Math.Round(hours, 2),
            Reason = dto.Reason,
            Status = "Pending"
        };

        _db.UndertimeRequests.Add(request);
        await _db.SaveChangesAsync();

        await _db.Entry(request).Reference(r => r.Employee).LoadAsync();
        await NotifyApproverAsync(request);

        return ToDto(request);
    }

    public async Task<bool> IsApproverAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return false;
        return await _db.LeaveApprovers.AnyAsync(a => a.ApproverEmployeeId == employee.Id);
    }

    public async Task<List<UndertimeRequestDto>> GetPendingApprovalsAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return new List<UndertimeRequestDto>();

        var departments = await _db.LeaveApprovers
            .Where(a => a.ApproverEmployeeId == employee.Id)
            .Select(a => a.Department)
            .ToListAsync();

        if (departments.Count == 0) return new List<UndertimeRequestDto>();

        var requests = await _db.UndertimeRequests
            .Include(r => r.Employee)
            .Where(r => r.Status == "Pending" && departments.Contains(r.Employee.Department))
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(ToDto).ToList();
    }

    public async Task<UndertimeRequestDto?> DecideAsync(Guid userId, Guid requestId, DecideUndertimeDto dto)
    {
        var deciderEmployee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (deciderEmployee is null) return null;

        var request = await _db.UndertimeRequests
            .Include(r => r.Employee)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request is null || request.Status != "Pending") return null;

        request.Status = dto.Approved ? "Approved" : "Rejected";
        request.DecidedByEmployeeId = deciderEmployee.Id;
        request.DecisionNotes = dto.Notes;
        request.DecidedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _db.Entry(request).Reference(r => r.DecidedByEmployee).LoadAsync();

        await NotifyEmployeeOfDecisionAsync(request);

        return ToDto(request);
    }

    private async Task NotifyApproverAsync(UndertimeRequest request)
    {
        var approverLink = await _db.LeaveApprovers
            .Include(a => a.ApproverEmployee)
            .FirstOrDefaultAsync(a => a.Department == request.Employee.Department);
        if (approverLink is null) return;

        var email = approverLink.ApproverEmployee.CompanyEmail ?? approverLink.ApproverEmployee.PersonalEmail;
        if (string.IsNullOrWhiteSpace(email)) return;

        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var slug = DepartmentSlug(request.Employee.Department);
        var subject = $"New Undertime Request - {request.Employee.FirstName} {request.Employee.LastName}";
        var bodyHtml = EmailTemplateBuilder.InfoRow("Employee", $"{request.Employee.FirstName} {request.Employee.LastName} ({request.Employee.Department})")
            + EmailTemplateBuilder.InfoRow("Date", $"{request.Date:MMM d, yyyy}, {request.StartTime:h:mm tt} - {request.EndTime:h:mm tt} ({request.Hours} hour(s))")
            + EmailTemplateBuilder.InfoRow("Reason", request.Reason);

        var html = EmailTemplateBuilder.Build("New Undertime Request", bodyHtml, "Review Request", FrontendUrl($"/{slug}/leave/approvals"));

        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, email, subject, html);
    }

    private async Task NotifyEmployeeOfDecisionAsync(UndertimeRequest request)
    {
        var email = request.Employee.CompanyEmail ?? request.Employee.PersonalEmail;
        if (string.IsNullOrWhiteSpace(email)) return;

        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var slug = DepartmentSlug(request.Employee.Department);
        var subject = $"Undertime Request {request.Status} - {request.Date:MMM d, yyyy}";
        var bodyHtml = EmailTemplateBuilder.InfoRow("Date", $"{request.Date:MMM d, yyyy}, {request.StartTime:h:mm tt} - {request.EndTime:h:mm tt} ({request.Hours} hour(s))")
            + EmailTemplateBuilder.InfoRow("Status", request.Status)
            + (string.IsNullOrWhiteSpace(request.DecisionNotes) ? "" : EmailTemplateBuilder.InfoRow("Notes", request.DecisionNotes));

        var html = EmailTemplateBuilder.Build($"Undertime Request {request.Status}", bodyHtml, "View My Undertime", FrontendUrl($"/{slug}/leave/undertime"));

        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, email, subject, html);
    }

    private static UndertimeRequestDto ToDto(UndertimeRequest r) => new()
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
        DecidedByName = r.DecidedByEmployee is null ? null : $"{r.DecidedByEmployee.FirstName} {r.DecidedByEmployee.LastName}",
        DecisionNotes = r.DecisionNotes,
        DecidedAt = r.DecidedAt,
        CreatedAt = r.CreatedAt
    };
}