using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using STLAF.Api.Common.Entities;
using STLAF.Api.Common.Services;
using STLAF.Api.Data;
using STLAF.Api.Departments.HRAdmin.DTOs;
using STLAF.Api.Departments.HRAdmin.Entities;

namespace STLAF.Api.Departments.HRAdmin.Services;

public class LeaveService : ILeaveService
{
    private readonly AppDbContext _db;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<LeaveService> _logger;

    public LeaveService(AppDbContext db, IEmailSender emailSender, ILogger<LeaveService> logger)
    {
        _db = db;
        _emailSender = emailSender;
        _logger = logger;
    }

    // ---------- Leave Types ----------

    public async Task<List<LeaveTypeDto>> GetLeaveTypesAsync()
    {
        return await _db.LeaveTypes
            .OrderBy(t => t.Name)
            .Select(t => new LeaveTypeDto { Id = t.Id, Name = t.Name, DefaultCredits = t.DefaultCredits })
            .ToListAsync();
    }

    public async Task<LeaveTypeDto> CreateLeaveTypeAsync(CreateLeaveTypeDto dto)
    {
        var type = new LeaveType { Name = dto.Name, DefaultCredits = dto.DefaultCredits };
        _db.LeaveTypes.Add(type);
        await _db.SaveChangesAsync();
        return new LeaveTypeDto { Id = type.Id, Name = type.Name, DefaultCredits = type.DefaultCredits };
    }

    public async Task<LeaveTypeDto?> UpdateLeaveTypeAsync(Guid id, UpdateLeaveTypeDto dto)
    {
        var type = await _db.LeaveTypes.FirstOrDefaultAsync(t => t.Id == id);
        if (type is null) return null;

        type.Name = dto.Name;
        type.DefaultCredits = dto.DefaultCredits;
        await _db.SaveChangesAsync();
        return new LeaveTypeDto { Id = type.Id, Name = type.Name, DefaultCredits = type.DefaultCredits };
    }

    // ---------- Approvers ----------

    public async Task<List<LeaveApproverDto>> GetApproversAsync()
    {
        return await _db.LeaveApprovers
            .Include(a => a.ApproverEmployee)
            .OrderBy(a => a.Department)
            .Select(a => new LeaveApproverDto
            {
                Id = a.Id,
                Department = a.Department,
                ApproverEmployeeId = a.ApproverEmployeeId,
                ApproverName = a.ApproverEmployee.FirstName + " " + a.ApproverEmployee.LastName
            })
            .ToListAsync();
    }

    public async Task<LeaveApproverDto> SetApproverAsync(SetLeaveApproverDto dto)
    {
        var existing = await _db.LeaveApprovers.FirstOrDefaultAsync(a => a.Department == dto.Department);

        if (existing is null)
        {
            existing = new LeaveApprover { Department = dto.Department, ApproverEmployeeId = dto.ApproverEmployeeId };
            _db.LeaveApprovers.Add(existing);
        }
        else
        {
            existing.ApproverEmployeeId = dto.ApproverEmployeeId;
        }

        await _db.SaveChangesAsync();

        var employee = await _db.Employees.FirstAsync(e => e.Id == dto.ApproverEmployeeId);

        return new LeaveApproverDto
        {
            Id = existing.Id,
            Department = existing.Department,
            ApproverEmployeeId = existing.ApproverEmployeeId,
            ApproverName = $"{employee.FirstName} {employee.LastName}"
        };
    }

    // ---------- SMTP Senders ----------

    public async Task<List<SmtpSenderDto>> GetSmtpSendersAsync()
    {
        return await _db.SmtpSenders
            .OrderBy(s => s.Label)
            .Select(s => new SmtpSenderDto { Id = s.Id, Label = s.Label, Email = s.Email })
            .ToListAsync();
    }

    public async Task<SmtpSenderDto> CreateSmtpSenderAsync(CreateSmtpSenderDto dto)
    {
        var sender = new SmtpSender
        {
            Label = dto.Label,
            Email = dto.Email,
            AppPasswordValue = dto.AppPassword
        };

        _db.SmtpSenders.Add(sender);
        await _db.SaveChangesAsync();

        return new SmtpSenderDto { Id = sender.Id, Label = sender.Label, Email = sender.Email };
    }

    public async Task<TestSmtpSenderResultDto> TestSmtpSenderAsync(Guid id)
    {
        var sender = await _db.SmtpSenders.FirstOrDefaultAsync(s => s.Id == id);
        if (sender is null) return new TestSmtpSenderResultDto { Success = false, Error = "Sender not found." };

        var (success, error) = await _emailSender.TestConnectionAsync(sender.Email, sender.AppPasswordValue);
        return new TestSmtpSenderResultDto { Success = success, Error = error };
    }

    // ---------- Notification Setting ----------

    public async Task<LeaveNotificationSettingDto?> GetNotificationSettingAsync()
    {
        var setting = await _db.LeaveNotificationSettings
            .Include(s => s.SmtpSender)
            .FirstOrDefaultAsync();

        if (setting is null) return null;

        return new LeaveNotificationSettingDto
        {
            SmtpSenderId = setting.SmtpSenderId,
            SenderEmail = setting.SmtpSender.Email,
            SenderLabel = setting.SmtpSender.Label
        };
    }

    public async Task<LeaveNotificationSettingDto> SetNotificationSettingAsync(SetLeaveNotificationSettingDto dto)
    {
        var existing = await _db.LeaveNotificationSettings.FirstOrDefaultAsync();

        if (existing is null)
        {
            existing = new LeaveNotificationSetting { SmtpSenderId = dto.SmtpSenderId };
            _db.LeaveNotificationSettings.Add(existing);
        }
        else
        {
            existing.SmtpSenderId = dto.SmtpSenderId;
        }

        await _db.SaveChangesAsync();

        var sender = await _db.SmtpSenders.FirstAsync(s => s.Id == dto.SmtpSenderId);

        return new LeaveNotificationSettingDto
        {
            SmtpSenderId = dto.SmtpSenderId,
            SenderEmail = sender.Email,
            SenderLabel = sender.Label
        };
    }

    // ---------- Employee-facing ----------

    public async Task<List<LeaveBalanceDto>> GetMyBalancesAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return new List<LeaveBalanceDto>();

        var types = await _db.LeaveTypes.ToListAsync();
        var overrides = await _db.EmployeeLeaveCredits
            .Where(c => c.EmployeeId == employee.Id)
            .ToListAsync();
        var year = DateTime.UtcNow.Year;

        var approvedThisYear = await _db.LeaveRequests
        .Where(r => r.EmployeeId == employee.Id
            && (r.Status == "Approved" || r.Status == "RetractionRequested")
            && r.StartDate.Year == year)
        .ToListAsync();

        return types.Select(t =>
        {
            var used = approvedThisYear.Where(r => r.LeaveTypeId == t.Id).Sum(r => r.Days);
            var effectiveCredits = overrides.FirstOrDefault(o => o.LeaveTypeId == t.Id)?.Credits ?? t.DefaultCredits;
            return new LeaveBalanceDto
            {
                LeaveTypeId = t.Id,
                LeaveTypeName = t.Name,
                DefaultCredits = effectiveCredits,
                UsedCredits = used,
                RemainingCredits = Math.Max(0, effectiveCredits - used)
            };
        }).ToList();
    }

    public async Task<List<LeaveRequestDto>> GetMyRequestsAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return new List<LeaveRequestDto>();

        var requests = await _db.LeaveRequests
            .Include(r => r.Employee)
            .Include(r => r.LeaveType)
            .Include(r => r.DecidedByEmployee)
            .Where(r => r.EmployeeId == employee.Id)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(ToDto).ToList();
    }

    public async Task<LeaveRequestDto> CreateRequestAsync(Guid userId, CreateLeaveRequestDto dto)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId)
            ?? throw new InvalidOperationException("No employee record linked to this account.");

        var days = (dto.EndDate.Date - dto.StartDate.Date).Days + 1;
        if (days < 1) throw new InvalidOperationException("Invalid date range.");

        var request = new LeaveRequest
        {
            EmployeeId = employee.Id,
            LeaveTypeId = dto.LeaveTypeId,
            StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc),
            EndDate = DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc),
            Days = days,
            Reason = dto.Reason,
            Status = "Pending"
        };

        _db.LeaveRequests.Add(request);
        await _db.SaveChangesAsync();

        await _db.Entry(request).Reference(r => r.Employee).LoadAsync();
        await _db.Entry(request).Reference(r => r.LeaveType).LoadAsync();

        await NotifyApproverAsync(request);

        return ToDto(request);
    }

    // ---------- Approver-facing ----------

    public async Task<bool> IsApproverAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return false;

        return await _db.LeaveApprovers.AnyAsync(a => a.ApproverEmployeeId == employee.Id);
    }

    public async Task<List<LeaveRequestDto>> GetPendingApprovalsAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return new List<LeaveRequestDto>();

        var departments = await _db.LeaveApprovers
            .Where(a => a.ApproverEmployeeId == employee.Id)
            .Select(a => a.Department)
            .ToListAsync();

        if (departments.Count == 0) return new List<LeaveRequestDto>();

        var requests = await _db.LeaveRequests
            .Include(r => r.Employee)
            .Include(r => r.LeaveType)
            .Where(r => r.Status == "Pending" && departments.Contains(r.Employee.Department))
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(ToDto).ToList();
    }

    public async Task<LeaveRequestDto?> DecideRequestAsync(Guid userId, Guid requestId, DecideLeaveRequestDto dto)
    {
        var approverEmployee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (approverEmployee is null) return null;

        var request = await _db.LeaveRequests
            .Include(r => r.Employee)
            .Include(r => r.LeaveType)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request is null) return null;

        request.Status = dto.Approved ? "Approved" : "Rejected";
        request.DecidedByEmployeeId = approverEmployee.Id;
        request.DecisionNotes = dto.Notes;
        request.DecidedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _db.Entry(request).Reference(r => r.DecidedByEmployee).LoadAsync();

        await NotifyEmployeeOfDecisionAsync(request);

        return ToDto(request);
    }

    public async Task<LeaveRequestDto?> RequestRetractionAsync(Guid userId, Guid requestId, RequestRetractionDto dto)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return null;

        var request = await _db.LeaveRequests
            .Include(r => r.Employee)
            .Include(r => r.LeaveType)
            .FirstOrDefaultAsync(r => r.Id == requestId && r.EmployeeId == employee.Id);

        if (request is null || request.Status != "Approved") return null;

        request.Status = "RetractionRequested";
        request.RetractionReason = dto.Reason;
        request.RetractionRequestedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await NotifyApproverOfRetractionAsync(request);

        return ToDto(request);
    }

    public async Task<List<LeaveRequestDto>> GetPendingRetractionsAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return new List<LeaveRequestDto>();

        var departments = await _db.LeaveApprovers
            .Where(a => a.ApproverEmployeeId == employee.Id)
            .Select(a => a.Department)
            .ToListAsync();

        if (departments.Count == 0) return new List<LeaveRequestDto>();

        var requests = await _db.LeaveRequests
            .Include(r => r.Employee)
            .Include(r => r.LeaveType)
            .Where(r => r.Status == "RetractionRequested" && departments.Contains(r.Employee.Department))
            .OrderBy(r => r.RetractionRequestedAt)
            .ToListAsync();

        return requests.Select(ToDto).ToList();
    }

    public async Task<LeaveRequestDto?> DecideRetractionAsync(Guid userId, Guid requestId, DecideRetractionDto dto)
    {
        var approverEmployee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (approverEmployee is null) return null;

        var request = await _db.LeaveRequests
            .Include(r => r.Employee)
            .Include(r => r.LeaveType)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request is null || request.Status != "RetractionRequested") return null;

        request.Status = dto.Approved ? "Retracted" : "Approved";
        request.RetractionDecidedByEmployeeId = approverEmployee.Id;
        request.RetractionDecisionNotes = dto.Notes;
        request.RetractionDecidedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _db.Entry(request).Reference(r => r.RetractionDecidedByEmployee).LoadAsync();

        await NotifyEmployeeOfRetractionDecisionAsync(request);

        return ToDto(request);
    }

    // ---------- Notifications ----------

    private async Task NotifyApproverAsync(LeaveRequest request)
    {
        var approverLink = await _db.LeaveApprovers
            .Include(a => a.ApproverEmployee)
            .FirstOrDefaultAsync(a => a.Department == request.Employee.Department);

        if (approverLink is null)
        {
            _logger.LogWarning("No approver configured for department {Department}; skipping notification.", request.Employee.Department);
            return;
        }

        var approverEmail = approverLink.ApproverEmployee.CompanyEmail ?? approverLink.ApproverEmployee.PersonalEmail;
        if (string.IsNullOrWhiteSpace(approverEmail))
        {
            _logger.LogWarning("Approver {ApproverId} has no company or personal email; skipping notification.", approverLink.ApproverEmployeeId);
            return;
        }

        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null)
        {
            _logger.LogWarning("No leave notification sender configured; skipping notification.");
            return;
        }

        var subject = $"New Leave Request - {request.Employee.FirstName} {request.Employee.LastName}";
        var body = $"{request.Employee.FirstName} {request.Employee.LastName} ({request.Employee.Department}) submitted a {request.LeaveType.Name} request from {request.StartDate:MMM d, yyyy} to {request.EndDate:MMM d, yyyy} ({request.Days} day(s)).\n\nReason: {request.Reason}\n\nPlease review this in the STLAF portal.";

        _logger.LogInformation("Sending leave notification from {From} to {To}.", setting.SmtpSender.Email, approverEmail);
        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, approverEmail, subject, body);
    }

    private async Task NotifyEmployeeOfDecisionAsync(LeaveRequest request)
    {
        var employeeEmail = request.Employee.CompanyEmail ?? request.Employee.PersonalEmail;
        if (string.IsNullOrWhiteSpace(employeeEmail))
        {
            _logger.LogWarning("Employee {EmployeeId} has no company or personal email; skipping decision notification.", request.EmployeeId);
            return;
        }

        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null)
        {
            _logger.LogWarning("No leave notification sender configured; skipping decision notification.");
            return;
        }

        var subject = $"Leave Request {request.Status} - {request.LeaveType.Name}";
        var body = $"Your {request.LeaveType.Name} request from {request.StartDate:MMM d, yyyy} to {request.EndDate:MMM d, yyyy} has been {request.Status.ToLower()}.\n\n{(string.IsNullOrWhiteSpace(request.DecisionNotes) ? "" : $"Notes: {request.DecisionNotes}")}";

        _logger.LogInformation("Sending decision notification from {From} to {To}.", setting.SmtpSender.Email, employeeEmail);
        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, employeeEmail, subject, body);
    }

    private async Task NotifyApproverOfRetractionAsync(LeaveRequest request)
    {
        var approverLink = await _db.LeaveApprovers
            .Include(a => a.ApproverEmployee)
            .FirstOrDefaultAsync(a => a.Department == request.Employee.Department);

        if (approverLink is null) return;

        var approverEmail = approverLink.ApproverEmployee.CompanyEmail ?? approverLink.ApproverEmployee.PersonalEmail;
        if (string.IsNullOrWhiteSpace(approverEmail)) return;

        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var subject = $"Leave Retraction Request - {request.Employee.FirstName} {request.Employee.LastName}";
        var body = $"{request.Employee.FirstName} {request.Employee.LastName} ({request.Employee.Department}) wants to retract their approved {request.LeaveType.Name} request ({request.StartDate:MMM d, yyyy} to {request.EndDate:MMM d, yyyy}, {request.Days} day(s)).\n\nReason for retraction: {request.RetractionReason}\n\nPlease review this in the STLAF portal.";

        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, approverEmail, subject, body);
    }

    private async Task NotifyEmployeeOfRetractionDecisionAsync(LeaveRequest request)
    {
        var employeeEmail = request.Employee.CompanyEmail ?? request.Employee.PersonalEmail;
        if (string.IsNullOrWhiteSpace(employeeEmail)) return;

        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var outcome = request.Status == "Retracted" ? "approved — your leave credit has been returned" : "declined — the original approved leave stands";
        var subject = $"Leave Retraction {(request.Status == "Retracted" ? "Approved" : "Declined")} - {request.LeaveType.Name}";
        var body = $"Your request to retract the {request.LeaveType.Name} leave from {request.StartDate:MMM d, yyyy} to {request.EndDate:MMM d, yyyy} was {outcome}.\n\n{(string.IsNullOrWhiteSpace(request.RetractionDecisionNotes) ? "" : $"Notes: {request.RetractionDecisionNotes}")}";

        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, employeeEmail, subject, body);
    }

    private static LeaveRequestDto ToDto(LeaveRequest r) => new()
    {
        Id = r.Id,
        EmployeeId = r.EmployeeId,
        EmployeeName = $"{r.Employee.FirstName} {r.Employee.LastName}",
        Department = r.Employee.Department,
        LeaveTypeName = r.LeaveType.Name,
        StartDate = r.StartDate,
        EndDate = r.EndDate,
        Days = r.Days,
        Reason = r.Reason,
        Status = r.Status,
        DecidedByName = r.DecidedByEmployee is null ? null : $"{r.DecidedByEmployee.FirstName} {r.DecidedByEmployee.LastName}",
        DecisionNotes = r.DecisionNotes,
        DecidedAt = r.DecidedAt,
        CreatedAt = r.CreatedAt,
        RetractionReason = r.RetractionReason,
        RetractionRequestedAt = r.RetractionRequestedAt,
        RetractionDecidedByName = r.RetractionDecidedByEmployee is null ? null : $"{r.RetractionDecidedByEmployee.FirstName} {r.RetractionDecidedByEmployee.LastName}",
        RetractionDecisionNotes = r.RetractionDecisionNotes,
        RetractionDecidedAt = r.RetractionDecidedAt
    };

    public async Task<EmployeeProfileDto?> GetMyProfileAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return null;

        return new EmployeeProfileDto
        {
            CompanyId = employee.CompanyId,
            FullName = $"{employee.FirstName} {employee.LastName}",
            Department = employee.Department,
            OfficePosition = employee.OfficePosition
        };
    }
    public async Task<bool> DeleteSmtpSenderAsync(Guid id)
    {
        var sender = await _db.SmtpSenders.FirstOrDefaultAsync(s => s.Id == id);
        if (sender is null) return false;

        // If this sender is the currently active notification sender, clear that setting too
        var activeSetting = await _db.LeaveNotificationSettings.FirstOrDefaultAsync(s => s.SmtpSenderId == id);
        if (activeSetting is not null)
        {
            _db.LeaveNotificationSettings.Remove(activeSetting);
        }

        _db.SmtpSenders.Remove(sender);
        await _db.SaveChangesAsync();
        return true;
    }
    public async Task<List<EmployeeLeaveCreditDto>> GetEmployeeLeaveCreditsAsync(Guid employeeId)
    {
        var types = await _db.LeaveTypes.OrderBy(t => t.Name).ToListAsync();
        var overrides = await _db.EmployeeLeaveCredits
            .Where(c => c.EmployeeId == employeeId)
            .ToListAsync();

        return types.Select(t =>
        {
            var overrideEntry = overrides.FirstOrDefault(o => o.LeaveTypeId == t.Id);
            return new EmployeeLeaveCreditDto
            {
                LeaveTypeId = t.Id,
                LeaveTypeName = t.Name,
                DefaultCredits = t.DefaultCredits,
                OverrideCredits = overrideEntry?.Credits,
                EffectiveCredits = overrideEntry?.Credits ?? t.DefaultCredits
            };
        }).ToList();
    }

    public async Task<List<EmployeeLeaveCreditDto>> SetEmployeeLeaveCreditAsync(Guid employeeId, SetEmployeeLeaveCreditDto dto)
    {
        var existing = await _db.EmployeeLeaveCredits
            .FirstOrDefaultAsync(c => c.EmployeeId == employeeId && c.LeaveTypeId == dto.LeaveTypeId);

        if (dto.Credits is null)
        {
            if (existing is not null)
            {
                _db.EmployeeLeaveCredits.Remove(existing);
                await _db.SaveChangesAsync();
            }
        }
        else if (existing is null)
        {
            _db.EmployeeLeaveCredits.Add(new EmployeeLeaveCredit
            {
                EmployeeId = employeeId,
                LeaveTypeId = dto.LeaveTypeId,
                Credits = dto.Credits.Value
            });
            await _db.SaveChangesAsync();
        }
        else
        {
            existing.Credits = dto.Credits.Value;
            await _db.SaveChangesAsync();
        }

        return await GetEmployeeLeaveCreditsAsync(employeeId);
    }

}