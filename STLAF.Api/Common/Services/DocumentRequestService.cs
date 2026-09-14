using Microsoft.EntityFrameworkCore;
using STLAF.Api.Common.DTOs;
using STLAF.Api.Common.Email;
using STLAF.Api.Common.Entities;
using STLAF.Api.Data;
using STLAF.Api.Departments.HRAdmin.Entities;

namespace STLAF.Api.Common.Services;

public class DocumentRequestService : IDocumentRequestService
{
    private readonly AppDbContext _db;
    private readonly IEmailSender _emailSender;
    private readonly IFileStorageService _fileStorage;
    private readonly IConfiguration _config;

    public DocumentRequestService(AppDbContext db, IEmailSender emailSender, IFileStorageService fileStorage, IConfiguration config)
    {
        _db = db;
        _emailSender = emailSender;
        _fileStorage = fileStorage;
        _config = config;
    }

    private string FrontendUrl(string path) => $"{_config["Frontend:BaseUrl"]?.TrimEnd('/')}{path}";

    private static string DepartmentSlug(string department) =>
        department == "HRAdmin" ? "hr-admin" : department.ToLowerInvariant();

    private static readonly string[] EditableStatuses = { "PendingEA", "RejectedByEA", "RejectedByPartner" };
    private static readonly string[] RejectedStatuses = { "RejectedByEA", "RejectedByPartner" };
    private static readonly string[] PartnerArchivableStatuses = { "Approved", "RejectedByPartner", "ReturnedToEA" };


    public async Task<List<DocumentRequestDto>> GetMyRequestsAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return new List<DocumentRequestDto>();

        var requests = await _db.DocumentRequests
            .Where(r => r.EmployeeId == employee.Id && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return await ToDtoListAsync(requests);
    }

    public async Task<DocumentRequestDto> CreateRequestAsync(Guid userId, CreateDocumentRequestDto dto, Stream? fileStream, string? fileName, string? contentType)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId)
            ?? throw new InvalidOperationException("No employee record linked to this account.");

        var year = DateTime.UtcNow.Year;
        var countThisYear = await _db.DocumentRequests.CountAsync(r => r.CreatedAt.Year == year);
        var trackingNumber = $"DOC-{year}-{(countThisYear + 1):D4}";

        var request = new DocumentRequest
        {
            TrackingNumber = trackingNumber,
            EmployeeId = employee.Id,
            Title = dto.Title,
            Note = dto.Note,
            DocumentLink = dto.DocumentLink,
            DeadlineDate = dto.DeadlineDate.HasValue ? DateTime.SpecifyKind(dto.DeadlineDate.Value, DateTimeKind.Utc) : null,
            Status = "PendingEA"
        };

        if (fileStream is not null && fileName is not null && contentType is not null)
        {
            var uploadResult = await _fileStorage.UploadFileAsync(fileStream, fileName, contentType);
            if (uploadResult is null)
            {
                throw new InvalidOperationException("File upload failed. Please try again or contact IT.");
            }
            request.FileObjectKey = uploadResult.Value.objectKey;
            request.FileUrl = uploadResult.Value.url;
            request.FileName = fileName;
        }

        _db.DocumentRequests.Add(request);
        await _db.SaveChangesAsync();

        await NotifyExecutiveAssistantsAsync(request, employee);

        return (await ToDtoListAsync(new List<DocumentRequest> { request }))[0];
    }

    public async Task<DocumentRequestDto?> UpdateRequestAsync(Guid userId, Guid requestId, UpdateDocumentRequestDto dto, Stream? fileStream, string? fileName, string? contentType)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return null;

        var request = await _db.DocumentRequests.FirstOrDefaultAsync(r => r.Id == requestId);
        if (request is null || request.IsDeleted || request.EmployeeId != employee.Id) return null;
        if (!EditableStatuses.Contains(request.Status)) return null;

        request.Title = dto.Title;
        request.Note = dto.Note;
        request.DocumentLink = dto.DocumentLink;
        request.DeadlineDate = dto.DeadlineDate.HasValue ? DateTime.SpecifyKind(dto.DeadlineDate.Value, DateTimeKind.Utc) : null;

        if (fileStream is not null && fileName is not null && contentType is not null)
        {
            var uploadResult = await _fileStorage.UploadFileAsync(fileStream, fileName, contentType);
            if (uploadResult is null)
            {
                throw new InvalidOperationException("File upload failed. Please try again or contact IT.");
            }
            if (!string.IsNullOrWhiteSpace(request.FileObjectKey))
            {
                await _fileStorage.DeleteFileAsync(request.FileObjectKey);
            }
            request.FileObjectKey = uploadResult.Value.objectKey;
            request.FileUrl = uploadResult.Value.url;
            request.FileName = fileName;
        }
        else if (dto.RemoveFile)
        {
            if (!string.IsNullOrWhiteSpace(request.FileObjectKey))
            {
                await _fileStorage.DeleteFileAsync(request.FileObjectKey);
            }
            request.FileObjectKey = null;
            request.FileUrl = null;
            request.FileName = null;
        }

        await _db.SaveChangesAsync();

        return (await ToDtoListAsync(new List<DocumentRequest> { request }))[0];
    }

    public async Task<DocumentRequestDto?> ReturnRequestAsync(Guid userId, Guid requestId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return null;

        var request = await _db.DocumentRequests.FirstOrDefaultAsync(r => r.Id == requestId);
        if (request is null || request.IsDeleted || request.EmployeeId != employee.Id) return null;
        if (!RejectedStatuses.Contains(request.Status)) return null;

        request.Status = "PendingEA";
        request.EaDecidedByEmployeeId = null;
        request.EaDecisionNotes = null;
        request.EaDecidedAt = null;
        request.PartnerDecidedByEmployeeId = null;
        request.PartnerDecisionNotes = null;
        request.PartnerDecidedAt = null;

        await _db.SaveChangesAsync();

        await NotifyExecutiveAssistantsAsync(request, employee);

        return (await ToDtoListAsync(new List<DocumentRequest> { request }))[0];
    }

    public async Task<DocumentRequestDto?> DeleteRequestAsync(Guid userId, Guid requestId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return null;

        var request = await _db.DocumentRequests.FirstOrDefaultAsync(r => r.Id == requestId);
        if (request is null || request.IsDeleted || request.EmployeeId != employee.Id) return null;
        if (!EditableStatuses.Contains(request.Status)) return null;

        request.IsDeleted = true;
        request.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return (await ToDtoListAsync(new List<DocumentRequest> { request }))[0];
    }

    public async Task<List<DocumentRequestDto>> GetTrashAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return new List<DocumentRequestDto>();

        var requests = await _db.DocumentRequests
            .Where(r => r.EmployeeId == employee.Id && r.IsDeleted)
            .OrderByDescending(r => r.DeletedAt)
            .ToListAsync();

        return await ToDtoListAsync(requests);
    }

    public async Task<DocumentRequestDto?> RestoreRequestAsync(Guid userId, Guid requestId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return null;

        var request = await _db.DocumentRequests.FirstOrDefaultAsync(r => r.Id == requestId);
        if (request is null || !request.IsDeleted || request.EmployeeId != employee.Id) return null;

        request.IsDeleted = false;
        request.DeletedAt = null;
        await _db.SaveChangesAsync();

        return (await ToDtoListAsync(new List<DocumentRequest> { request }))[0];
    }

    public async Task<bool> HardDeleteRequestAsync(Guid userId, Guid requestId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return false;

        var request = await _db.DocumentRequests.FirstOrDefaultAsync(r => r.Id == requestId);
        if (request is null || !request.IsDeleted || request.EmployeeId != employee.Id) return false;

        if (!string.IsNullOrWhiteSpace(request.FileObjectKey))
        {
            await _fileStorage.DeleteFileAsync(request.FileObjectKey);
        }

        _db.DocumentRequests.Remove(request);
        await _db.SaveChangesAsync();
        return true;
    }


    public async Task<bool> IsExecutiveAssistantAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null || string.IsNullOrWhiteSpace(employee.OfficePosition)) return false;
        return await _db.ModuleAccessPositions.AnyAsync(m => m.Module == "document-ea-review" && m.OfficePosition == employee.OfficePosition);
    }

    public async Task<List<DocumentRequestDto>> GetPendingEaAsync(Guid userId)
    {
        var requests = await _db.DocumentRequests
            .Where(r => r.Status == "PendingEA" && !r.IsDeleted)
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();

        return await ToDtoListAsync(requests);
    }

    public async Task<DocumentRequestDto?> DecideEaAsync(Guid userId, Guid requestId, DecideDocumentRequestDto dto)
    {
        var eaEmployee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (eaEmployee is null) return null;

        var request = await _db.DocumentRequests.FirstOrDefaultAsync(r => r.Id == requestId);
        if (request is null || request.Status != "PendingEA") return null;

        request.EaDecidedByEmployeeId = eaEmployee.Id;
        request.EaDecisionNotes = dto.Notes;
        request.EaDecidedAt = DateTime.UtcNow;

        var submitter = await _db.Employees.FirstOrDefaultAsync(e => e.Id == request.EmployeeId);

        if (dto.Approved)
        {
            request.Status = "PendingPartner";
            await _db.SaveChangesAsync();
            if (submitter is not null) await NotifyPartnersAsync(request, submitter);
        }
        else
        {
            request.Status = "RejectedByEA";
            await _db.SaveChangesAsync();
            if (submitter is not null) await NotifySubmitterAsync(request, submitter, request.EaDecisionNotes);
        }

        return (await ToDtoListAsync(new List<DocumentRequest> { request }))[0];
    }

    public async Task<List<DocumentRequestDto>> GetReturnedToEaAsync(Guid userId)
    {
        var requests = await _db.DocumentRequests
            .Where(r => r.Status == "ReturnedToEA")
            .OrderBy(r => r.PartnerDecidedAt)
            .ToListAsync();

        return await ToDtoListAsync(requests);
    }

    public async Task<DocumentRequestDto?> ForwardRejectionAsync(Guid userId, Guid requestId)
    {
        var request = await _db.DocumentRequests.FirstOrDefaultAsync(r => r.Id == requestId);
        if (request is null || request.Status != "ReturnedToEA") return null;

        request.Status = "RejectedByPartner";
        await _db.SaveChangesAsync();

        var submitter = await _db.Employees.FirstOrDefaultAsync(e => e.Id == request.EmployeeId);
        if (submitter is not null) await NotifySubmitterAsync(request, submitter, request.PartnerDecisionNotes);

        return (await ToDtoListAsync(new List<DocumentRequest> { request }))[0];
    }


    public async Task<bool> IsPartnerReviewerAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null || string.IsNullOrWhiteSpace(employee.OfficePosition)) return false;
        return await _db.ModuleAccessPositions.AnyAsync(m => m.Module == "document-partner-review" && m.OfficePosition == employee.OfficePosition);
    }

    public async Task<List<DocumentRequestDto>> GetPendingPartnerAsync(Guid userId)
    {
        var requests = await _db.DocumentRequests
            .Where(r => r.Status == "PendingPartner")
            .OrderBy(r => r.EaDecidedAt)
            .ToListAsync();

        return await ToDtoListAsync(requests);
    }

    public async Task<DocumentRequestDto?> DecidePartnerAsync(Guid userId, Guid requestId, DecideDocumentRequestDto dto)
    {
        var partnerEmployee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (partnerEmployee is null) return null;

        var request = await _db.DocumentRequests.FirstOrDefaultAsync(r => r.Id == requestId);
        if (request is null || request.Status != "PendingPartner") return null;

        request.PartnerDecidedByEmployeeId = partnerEmployee.Id;
        request.PartnerDecisionNotes = dto.Notes;
        request.PartnerDecidedAt = DateTime.UtcNow;

        var submitter = await _db.Employees.FirstOrDefaultAsync(e => e.Id == request.EmployeeId);

        if (dto.Approved)
        {
            request.Status = "Approved";
            await _db.SaveChangesAsync();
            if (submitter is not null) await NotifySubmitterAsync(request, submitter, request.PartnerDecisionNotes);
        }
        else
        {
            request.Status = "ReturnedToEA";
            await _db.SaveChangesAsync();
            if (submitter is not null) await NotifyExecutiveAssistantsOfReturnAsync(request, submitter);
        }

        return (await ToDtoListAsync(new List<DocumentRequest> { request }))[0];
    }


    private async Task NotifyExecutiveAssistantsAsync(DocumentRequest request, Employee submitter)
    {
        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var eaPositions = await _db.ModuleAccessPositions.Where(m => m.Module == "document-ea-review").Select(m => m.OfficePosition).ToListAsync();
        var eaEmails = await _db.Employees
            .Where(e => eaPositions.Contains(e.OfficePosition) && e.CompanyEmail != null && e.CompanyEmail != "")
            .Select(e => e.CompanyEmail!)
            .ToListAsync();

        var subject = $"New Document Request {request.TrackingNumber} - {submitter.FirstName} {submitter.LastName}";
        var bodyHtml = EmailTemplateBuilder.InfoRow("Tracking Number", request.TrackingNumber)
            + EmailTemplateBuilder.InfoRow("Submitted By", $"{submitter.FirstName} {submitter.LastName} ({submitter.Department})")
            + EmailTemplateBuilder.InfoRow("Document Title", request.Title)
            + EmailTemplateBuilder.InfoRow("Note", request.Note);

        var html = EmailTemplateBuilder.Build("New Document Request", bodyHtml, "Review Request", FrontendUrl("/documents/ea-review"));

        foreach (var email in eaEmails)
        {
            await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, email, subject, html);
        }
    }

    private async Task NotifyPartnersAsync(DocumentRequest request, Employee submitter)
    {
        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var partnerPositions = await _db.ModuleAccessPositions.Where(m => m.Module == "document-partner-review").Select(m => m.OfficePosition).ToListAsync();
        var partnerEmails = await _db.Employees
            .Where(e => partnerPositions.Contains(e.OfficePosition) && e.CompanyEmail != null && e.CompanyEmail != "")
            .Select(e => e.CompanyEmail!)
            .ToListAsync();

        var subject = $"Document Request {request.TrackingNumber} Needs Your Approval";
        var bodyHtml = EmailTemplateBuilder.InfoRow("Tracking Number", request.TrackingNumber)
            + EmailTemplateBuilder.InfoRow("Submitted By", $"{submitter.FirstName} {submitter.LastName} ({submitter.Department})")
            + EmailTemplateBuilder.InfoRow("Document Title", request.Title)
            + $@"<p style=""margin:12px 0 4px;"">Approved by the Executive Assistant. This needs your final decision.</p>";

        var html = EmailTemplateBuilder.Build("Document Request Needs Approval", bodyHtml, "Review Request", FrontendUrl("/documents/partner-review"));

        foreach (var email in partnerEmails)
        {
            await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, email, subject, html);
        }
    }

    private async Task NotifyExecutiveAssistantsOfReturnAsync(DocumentRequest request, Employee submitter)
    {
        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var eaPositions = await _db.ModuleAccessPositions.Where(m => m.Module == "document-ea-review").Select(m => m.OfficePosition).ToListAsync();
        var eaEmails = await _db.Employees
            .Where(e => eaPositions.Contains(e.OfficePosition) && e.CompanyEmail != null && e.CompanyEmail != "")
            .Select(e => e.CompanyEmail!)
            .ToListAsync();

        var subject = $"Document Request {request.TrackingNumber} Rejected by Partner";
        var bodyHtml = EmailTemplateBuilder.InfoRow("Tracking Number", request.TrackingNumber)
            + EmailTemplateBuilder.InfoRow("Submitted By", $"{submitter.FirstName} {submitter.LastName} ({submitter.Department})")
            + EmailTemplateBuilder.InfoRow("Document Title", request.Title)
            + EmailTemplateBuilder.InfoRow("Partner Notes", request.PartnerDecisionNotes ?? "")
            + $@"<p style=""margin:12px 0 4px;"">Please inform the submitter of this decision.</p>";

        var html = EmailTemplateBuilder.Build("Document Request Rejected by Partner", bodyHtml, "View Request", FrontendUrl("/documents/ea-review"));

        foreach (var email in eaEmails)
        {
            await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, email, subject, html);
        }
    }

    private async Task NotifySubmitterAsync(DocumentRequest request, Employee submitter, string? notes)
    {
        var email = submitter.CompanyEmail ?? submitter.PersonalEmail;
        if (string.IsNullOrWhiteSpace(email)) return;

        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var slug = DepartmentSlug(submitter.Department);
        var statusLabel = request.Status switch
        {
            "Approved" => "Approved",
            "RejectedByEA" => "Rejected",
            "RejectedByPartner" => "Rejected",
            _ => request.Status
        };

        var subject = $"Document Request {request.TrackingNumber} {statusLabel}";
        var bodyHtml = EmailTemplateBuilder.InfoRow("Tracking Number", request.TrackingNumber)
            + EmailTemplateBuilder.InfoRow("Document Title", request.Title)
            + EmailTemplateBuilder.InfoRow("Status", statusLabel)
            + (string.IsNullOrWhiteSpace(notes) ? "" : EmailTemplateBuilder.InfoRow("Notes", notes));

        var html = EmailTemplateBuilder.Build($"Document Request {statusLabel}", bodyHtml, "View My Requests", FrontendUrl($"/{slug}/documents"));

        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, email, subject, html);
    }


    private async Task<List<DocumentRequestDto>> ToDtoListAsync(List<DocumentRequest> requests)
    {
        var employeeIds = requests.Select(r => r.EmployeeId)
            .Concat(requests.Where(r => r.EaDecidedByEmployeeId.HasValue).Select(r => r.EaDecidedByEmployeeId!.Value))
            .Concat(requests.Where(r => r.PartnerDecidedByEmployeeId.HasValue).Select(r => r.PartnerDecidedByEmployeeId!.Value))
            .Distinct()
            .ToList();

        var employees = await _db.Employees.Where(e => employeeIds.Contains(e.Id)).ToListAsync();

        var dtos = new List<DocumentRequestDto>();
        foreach (var r in requests)
        {
            var submitter = employees.FirstOrDefault(e => e.Id == r.EmployeeId);
            var eaDecider = r.EaDecidedByEmployeeId.HasValue ? employees.FirstOrDefault(e => e.Id == r.EaDecidedByEmployeeId.Value) : null;
            var partnerDecider = r.PartnerDecidedByEmployeeId.HasValue ? employees.FirstOrDefault(e => e.Id == r.PartnerDecidedByEmployeeId.Value) : null;

            var fileUrl = r.FileUrl;
            if (!string.IsNullOrWhiteSpace(r.FileObjectKey))
            {
                fileUrl = await _fileStorage.GetSignedUrlAsync(r.FileObjectKey) ?? r.FileUrl;
            }

            dtos.Add(new DocumentRequestDto
            {
                Id = r.Id,
                TrackingNumber = r.TrackingNumber,
                EmployeeId = r.EmployeeId,
                EmployeeName = submitter is null ? "(Former Employee)" : $"{submitter.FirstName} {submitter.LastName}",
                Department = submitter?.Department ?? "",
                Title = r.Title,
                Note = r.Note,
                DeadlineDate = r.DeadlineDate,
                DocumentLink = r.DocumentLink,
                FileUrl = fileUrl,
                FileName = r.FileName,
                Status = r.Status,
                EaDecidedByName = eaDecider is null ? null : $"{eaDecider.FirstName} {eaDecider.LastName}",
                EaDecisionNotes = r.EaDecisionNotes,
                EaDecidedAt = r.EaDecidedAt,
                PartnerDecidedByName = partnerDecider is null ? null : $"{partnerDecider.FirstName} {partnerDecider.LastName}",
                PartnerDecisionNotes = r.PartnerDecisionNotes,
                PartnerDecidedAt = r.PartnerDecidedAt,
                CreatedAt = r.CreatedAt,
                DeletedAt = r.DeletedAt,
                PartnerArchivedAt = r.PartnerArchivedAt
            });
        }

        return dtos;
    }
    public async Task<List<DocumentRequestDto>> GetPartnerDashboardAsync()
    {
        var relevantStatuses = new[] { "PendingPartner", "RejectedByPartner", "ReturnedToEA" };
        var requests = await _db.DocumentRequests
            .Where(r => relevantStatuses.Contains(r.Status) && !r.IsArchivedByPartner)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
        return await ToDtoListAsync(requests);
    }

    public async Task<PagedResult<DocumentRequestDto>> GetPartnerRepositoryAsync(int page, int pageSize, string? search)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var query =
            from r in _db.DocumentRequests
            join e in _db.Employees on r.EmployeeId equals e.Id
            where r.Status == "Approved" && !r.IsArchivedByPartner
            select new { Request = r, Employee = e };

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(x =>
                EF.Functions.ILike(x.Request.TrackingNumber, $"%{term}%") ||
                EF.Functions.ILike(x.Request.Title, $"%{term}%") ||
                EF.Functions.ILike(x.Employee.FirstName + " " + x.Employee.LastName, $"%{term}%"));
        }

        var totalCount = await query.CountAsync();

        var pageItems = await query
            .OrderByDescending(x => x.Request.PartnerDecidedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.Request)
            .ToListAsync();

        return new PagedResult<DocumentRequestDto>
        {
            Items = await ToDtoListAsync(pageItems),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<DocumentRequestDto?> ArchiveForPartnerAsync(Guid userId, Guid requestId)
    {
        var request = await _db.DocumentRequests.FirstOrDefaultAsync(r => r.Id == requestId);
        if (request is null || request.IsArchivedByPartner) return null;
        if (!PartnerArchivableStatuses.Contains(request.Status)) return null;

        request.IsArchivedByPartner = true;
        request.PartnerArchivedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return (await ToDtoListAsync(new List<DocumentRequest> { request }))[0];
    }

    public async Task<List<DocumentRequestDto>> GetPartnerTrashAsync(Guid userId)
    {
        var requests = await _db.DocumentRequests
            .Where(r => r.IsArchivedByPartner)
            .OrderByDescending(r => r.PartnerArchivedAt)
            .ToListAsync();

        return await ToDtoListAsync(requests);
    }

    public async Task<DocumentRequestDto?> RestoreForPartnerAsync(Guid userId, Guid requestId)
    {
        var request = await _db.DocumentRequests.FirstOrDefaultAsync(r => r.Id == requestId);
        if (request is null || !request.IsArchivedByPartner) return null;

        request.IsArchivedByPartner = false;
        request.PartnerArchivedAt = null;
        await _db.SaveChangesAsync();

        return (await ToDtoListAsync(new List<DocumentRequest> { request }))[0];
    }

    public async Task<bool> HardDeleteForPartnerAsync(Guid userId, Guid requestId)
    {
        var request = await _db.DocumentRequests.FirstOrDefaultAsync(r => r.Id == requestId);
        if (request is null || !request.IsArchivedByPartner) return false;

        if (!string.IsNullOrWhiteSpace(request.FileObjectKey))
        {
            await _fileStorage.DeleteFileAsync(request.FileObjectKey);
        }

        _db.DocumentRequests.Remove(request);
        await _db.SaveChangesAsync();
        return true;
    }

}