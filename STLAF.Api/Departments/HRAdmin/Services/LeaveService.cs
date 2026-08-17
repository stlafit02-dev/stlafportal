using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using STLAF.Api.Common.Email;
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
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<LeaveService> _logger;
    private readonly IConfiguration _config;

    public LeaveService(AppDbContext db, IEmailSender emailSender, IFileStorageService fileStorage, ILogger<LeaveService> logger, IConfiguration config)
    {
        _db = db;
        _emailSender = emailSender;
        _fileStorage = fileStorage;
        _logger = logger;
        _config = config;
    }

    private string FrontendUrl(string path) => $"{_config["Frontend:BaseUrl"]?.TrimEnd('/')}{path}";

    private static string DepartmentSlug(string department) =>
        department == "HRAdmin" ? "hr-admin" : department.ToLowerInvariant();

    // ---------- Leave Types ----------

    public async Task<List<LeaveTypeDto>> GetLeaveTypesAsync()
    {
        return await _db.LeaveTypes
            .OrderBy(t => t.Name)
            .Select(t => new LeaveTypeDto { Id = t.Id, Name = t.Name, DefaultCredits = t.DefaultCredits, RequiresMedicalAfterDays = t.RequiresMedicalAfterDays })
            .ToListAsync();
    }

    public async Task<LeaveTypeDto> CreateLeaveTypeAsync(CreateLeaveTypeDto dto)
    {
        var type = new LeaveType { Name = dto.Name, DefaultCredits = dto.DefaultCredits, RequiresMedicalAfterDays = dto.RequiresMedicalAfterDays };
        _db.LeaveTypes.Add(type);
        await _db.SaveChangesAsync();
        return new LeaveTypeDto { Id = type.Id, Name = type.Name, DefaultCredits = type.DefaultCredits, RequiresMedicalAfterDays = type.RequiresMedicalAfterDays };
    }

    public async Task<LeaveTypeDto?> UpdateLeaveTypeAsync(Guid id, UpdateLeaveTypeDto dto)
    {
        var type = await _db.LeaveTypes.FirstOrDefaultAsync(t => t.Id == id);
        if (type is null) return null;

        type.Name = dto.Name;
        type.DefaultCredits = dto.DefaultCredits;
        type.RequiresMedicalAfterDays = dto.RequiresMedicalAfterDays;
        await _db.SaveChangesAsync();
        return new LeaveTypeDto { Id = type.Id, Name = type.Name, DefaultCredits = type.DefaultCredits, RequiresMedicalAfterDays = type.RequiresMedicalAfterDays };
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

    public async Task<bool> DeleteSmtpSenderAsync(Guid id)
    {
        var sender = await _db.SmtpSenders.FirstOrDefaultAsync(s => s.Id == id);
        if (sender is null) return false;

        var activeSetting = await _db.LeaveNotificationSettings.FirstOrDefaultAsync(s => s.SmtpSenderId == id);
        if (activeSetting is not null)
        {
            _db.LeaveNotificationSettings.Remove(activeSetting);
        }

        _db.SmtpSenders.Remove(sender);
        await _db.SaveChangesAsync();
        return true;
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

    // ---------- Employee Leave Credit overrides ----------

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

    // ---------- Employee-facing ----------

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
            decimal effectiveCredits = overrides.FirstOrDefault(o => o.LeaveTypeId == t.Id)?.Credits ?? t.DefaultCredits;
            return new LeaveBalanceDto
            {
                LeaveTypeId = t.Id,
                LeaveTypeName = t.Name,
                DefaultCredits = effectiveCredits,
                UsedCredits = used,
                RemainingCredits = Math.Max(0m, effectiveCredits - used)
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

        var hasBlocker = await _db.MedicalCertificates
            .AnyAsync(m => m.EmployeeId == employee.Id && m.Status != "Verified");

        decimal days;
        if (dto.IsHalfDay)
        {
            if (dto.StartDate.Date != dto.EndDate.Date)
                throw new InvalidOperationException("Half-day leave must have the same start and end date.");

            days = 0.5m;
        }
        else
        {
            days = CalculateBusinessDays(dto.StartDate, dto.EndDate);
        }

        if (days < 0.5m) throw new InvalidOperationException("Invalid date range.");

        // A pending/unverified medical certificate no longer blocks submission —
        // it just forces this leave to be unpaid, regardless of the employee's checkbox choice.
        var isPaid = hasBlocker ? false : dto.IsPaid;

        var request = new LeaveRequest
        {
            EmployeeId = employee.Id,
            LeaveTypeId = dto.LeaveTypeId,
            StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc),
            EndDate = DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc),
            Days = days,
            Reason = dto.Reason,
            Status = "Pending",
            IsPaid = isPaid
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

        if (dto.Approved
            && request.LeaveType.RequiresMedicalAfterDays.HasValue
            && request.Days >= request.LeaveType.RequiresMedicalAfterDays.Value)
        {
            var alreadyExists = await _db.MedicalCertificates.AnyAsync(m => m.LeaveRequestId == request.Id);
            if (!alreadyExists)
            {
                _db.MedicalCertificates.Add(new MedicalCertificate
                {
                    EmployeeId = request.EmployeeId,
                    LeaveRequestId = request.Id,
                    Status = "PendingUpload"
                });
                await _db.SaveChangesAsync();
            }
        }

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

    // ---------- Medical Certificates ----------

    public async Task<bool> HasBlockingMedicalCertificateAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return false;

        return await _db.MedicalCertificates.AnyAsync(m => m.EmployeeId == employee.Id && m.Status != "Verified");
    }

    public async Task<List<MedicalCertificateDto>> GetMyMedicalCertificatesAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return new List<MedicalCertificateDto>();

        var certs = await _db.MedicalCertificates
            .Include(m => m.Employee)
            .Include(m => m.VerifiedByEmployee)
            .Where(m => m.EmployeeId == employee.Id)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        return await ToMedicalDtoListAsync(certs);
    }

    public async Task<MedicalCertificateDto?> UploadMedicalCertificateAsync(Guid userId, Guid certificateId, Stream fileStream, string fileName, string contentType)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return null;

        var cert = await _db.MedicalCertificates
            .Include(m => m.Employee)
            .FirstOrDefaultAsync(m => m.Id == certificateId && m.EmployeeId == employee.Id);

        if (cert is null || cert.Status == "Verified") return null;

        var uploadResult = await _fileStorage.UploadFileAsync(fileStream, fileName, contentType);
        if (uploadResult is null)
        {
            throw new InvalidOperationException("Upload failed. Please try again or contact IT.");
        }

        cert.DriveFileId = uploadResult.Value.objectKey;
        cert.DriveFileUrl = uploadResult.Value.url;
        cert.UploadedAt = DateTime.UtcNow;
        cert.Status = "PendingVerification";

        await _db.SaveChangesAsync();
        await NotifyHrOfMedicalUploadAsync(cert);

        return ToMedicalDto(cert);
    }

    public async Task<List<MedicalCertificateDto>> GetPendingMedicalVerificationsAsync()
    {
        var certs = await _db.MedicalCertificates
            .Include(m => m.Employee)
            .Include(m => m.VerifiedByEmployee)
            .Where(m => m.Status == "PendingVerification")
            .OrderBy(m => m.UploadedAt)
            .ToListAsync();

        return await ToMedicalDtoListAsync(certs);
    }

    public async Task<MedicalCertificateDto?> VerifyMedicalCertificateAsync(Guid userId, Guid certificateId, VerifyMedicalCertificateDto dto)
    {
        var hrEmployee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (hrEmployee is null) return null;

        var cert = await _db.MedicalCertificates
            .Include(m => m.Employee)
            .FirstOrDefaultAsync(m => m.Id == certificateId);

        if (cert is null || cert.Status != "PendingVerification") return null;

        cert.Status = dto.Approved ? "Verified" : "Rejected";
        cert.VerifiedByEmployeeId = hrEmployee.Id;
        cert.VerificationNotes = dto.Notes;
        cert.VerifiedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _db.Entry(cert).Reference(m => m.VerifiedByEmployee).LoadAsync();

        return ToMedicalDto(cert);
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

        var slug = DepartmentSlug(request.Employee.Department);
        var subject = $"New Leave Request - {request.Employee.FirstName} {request.Employee.LastName}";
        var bodyHtml = EmailTemplateBuilder.InfoRow("Employee", $"{request.Employee.FirstName} {request.Employee.LastName} ({request.Employee.Department})")
            + EmailTemplateBuilder.InfoRow("Leave Type", request.LeaveType.Name)
            + EmailTemplateBuilder.InfoRow("Dates", $"{request.StartDate:MMM d, yyyy} to {request.EndDate:MMM d, yyyy} ({request.Days} day(s))")
            + EmailTemplateBuilder.InfoRow("Reason", request.Reason);

        var html = EmailTemplateBuilder.Build("New Leave Request", bodyHtml, "Review Request", FrontendUrl($"/{slug}/leave/approvals"));

        _logger.LogInformation("Sending leave notification from {From} to {To}.", setting.SmtpSender.Email, approverEmail);
        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, approverEmail, subject, html);
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

        var slug = DepartmentSlug(request.Employee.Department);
        var subject = $"Leave Request {request.Status} - {request.LeaveType.Name}";
        var bodyHtml = EmailTemplateBuilder.InfoRow("Leave Type", request.LeaveType.Name)
            + EmailTemplateBuilder.InfoRow("Dates", $"{request.StartDate:MMM d, yyyy} to {request.EndDate:MMM d, yyyy}")
            + EmailTemplateBuilder.InfoRow("Status", request.Status)
            + (string.IsNullOrWhiteSpace(request.DecisionNotes) ? "" : EmailTemplateBuilder.InfoRow("Notes", request.DecisionNotes));

        var html = EmailTemplateBuilder.Build($"Leave Request {request.Status}", bodyHtml, "View My Leave", FrontendUrl($"/{slug}/leave/my-leave"));

        _logger.LogInformation("Sending decision notification from {From} to {To}.", setting.SmtpSender.Email, employeeEmail);
        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, employeeEmail, subject, html);
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

        var slug = DepartmentSlug(request.Employee.Department);
        var subject = $"Leave Retraction Request - {request.Employee.FirstName} {request.Employee.LastName}";
        var bodyHtml = EmailTemplateBuilder.InfoRow("Employee", $"{request.Employee.FirstName} {request.Employee.LastName} ({request.Employee.Department})")
            + EmailTemplateBuilder.InfoRow("Original Leave", $"{request.LeaveType.Name}, {request.StartDate:MMM d, yyyy} to {request.EndDate:MMM d, yyyy} ({request.Days} day(s))")
            + EmailTemplateBuilder.InfoRow("Retraction Reason", request.RetractionReason ?? "");

        var html = EmailTemplateBuilder.Build("Leave Retraction Request", bodyHtml, "Review Retraction", FrontendUrl($"/{slug}/leave/approvals"));

        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, approverEmail, subject, html);
    }

    private async Task NotifyEmployeeOfRetractionDecisionAsync(LeaveRequest request)
    {
        var employeeEmail = request.Employee.CompanyEmail ?? request.Employee.PersonalEmail;
        if (string.IsNullOrWhiteSpace(employeeEmail)) return;

        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var slug = DepartmentSlug(request.Employee.Department);
        var outcome = request.Status == "Retracted" ? "approved — your leave credit has been returned" : "declined — the original approved leave stands";
        var subject = $"Leave Retraction {(request.Status == "Retracted" ? "Approved" : "Declined")} - {request.LeaveType.Name}";
        var bodyHtml = EmailTemplateBuilder.InfoRow("Leave Type", request.LeaveType.Name)
            + EmailTemplateBuilder.InfoRow("Dates", $"{request.StartDate:MMM d, yyyy} to {request.EndDate:MMM d, yyyy}")
            + $@"<p style=""margin:12px 0 4px;"">Your retraction request was {outcome}.</p>"
            + (string.IsNullOrWhiteSpace(request.RetractionDecisionNotes) ? "" : EmailTemplateBuilder.InfoRow("Notes", request.RetractionDecisionNotes));

        var html = EmailTemplateBuilder.Build($"Leave Retraction {(request.Status == "Retracted" ? "Approved" : "Declined")}", bodyHtml, "View My Leave", FrontendUrl($"/{slug}/leave/my-leave"));

        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, employeeEmail, subject, html);
    }

    private async Task NotifyHrOfMedicalUploadAsync(MedicalCertificate cert)
    {
        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var hrEmails = await _db.Employees
            .Where(e => e.Department == "HRAdmin" && e.Status == "Active" && e.CompanyEmail != null && e.CompanyEmail != "")
            .Select(e => e.CompanyEmail!)
            .ToListAsync();

        var subject = $"Medical Certificate Uploaded - {cert.Employee.FirstName} {cert.Employee.LastName}";
        var bodyHtml = EmailTemplateBuilder.InfoRow("Employee", $"{cert.Employee.FirstName} {cert.Employee.LastName} ({cert.Employee.Department})")
            + $@"<p style=""margin:12px 0 4px;"">A fit-to-work medical certificate has been uploaded and needs verification.</p>";

        var html = EmailTemplateBuilder.Build("Medical Certificate Uploaded", bodyHtml, "Review Certificate", FrontendUrl("/hr-admin/medical-certificates"));

        foreach (var email in hrEmails)
        {
            await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, email, subject, html);
        }
    }

    // ---------- DTO mapping ----------

    private async Task<List<MedicalCertificateDto>> ToMedicalDtoListAsync(List<MedicalCertificate> certs)
    {
        var dtos = new List<MedicalCertificateDto>();
        foreach (var cert in certs)
        {
            var dto = ToMedicalDto(cert);
            if (!string.IsNullOrWhiteSpace(cert.DriveFileId))
            {
                dto.DriveFileUrl = await _fileStorage.GetSignedUrlAsync(cert.DriveFileId) ?? dto.DriveFileUrl;
            }
            dtos.Add(dto);
        }
        return dtos;
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
        IsPaid = r.IsPaid,
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

    private static MedicalCertificateDto ToMedicalDto(MedicalCertificate m) => new()
    {
        Id = m.Id,
        LeaveRequestId = m.LeaveRequestId,
        EmployeeName = $"{m.Employee.FirstName} {m.Employee.LastName}",
        Department = m.Employee.Department,
        Status = m.Status,
        DriveFileUrl = m.DriveFileUrl,
        UploadedAt = m.UploadedAt,
        VerifiedByName = m.VerifiedByEmployee is null ? null : $"{m.VerifiedByEmployee.FirstName} {m.VerifiedByEmployee.LastName}",
        VerificationNotes = m.VerificationNotes,
        VerifiedAt = m.VerifiedAt
    };

    private static decimal CalculateBusinessDays(DateTime start, DateTime end)
    {
        var days = 0;
        for (var date = start.Date; date <= end.Date; date = date.AddDays(1))
        {
            if (date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday)
            {
                days++;
            }
        }
        return days;
    }
}