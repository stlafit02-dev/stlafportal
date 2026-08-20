using Microsoft.EntityFrameworkCore;
using STLAF.Api.Common.DTOs;
using STLAF.Api.Common.Email;
using STLAF.Api.Common.Entities;
using STLAF.Api.Data;

namespace STLAF.Api.Common.Services;

public class IntakeFormService : IIntakeFormService
{
    private readonly AppDbContext _db;
    private readonly IEmailSender _emailSender;
    private readonly IFileStorageService _fileStorage;

    private const bool IsTestMode = true; // Set to false before going live

    private static readonly string[] ConsultationPreferenceOptions =
    {
        "In-Person", "Video Call", "Phone Call"
    };

    private static readonly string[] TimeSlotOptions =
    {
        "8:30 AM - 9:30 AM", "9:30 AM - 10:30 AM", "10:30 AM - 11:30 AM",
        "1:00 PM - 2:00 PM", "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM",
        "4:00 PM - 5:00 PM"
    };

    private static readonly string[] HowDidYouFindUsOptions =
    {
        "Google Search", "Referral", "Social Media", "Existing Client", "Website", "Other"
    };

    public IntakeFormService(AppDbContext db, IEmailSender emailSender, IFileStorageService fileStorage)
    {
        _db = db;
        _emailSender = emailSender;
        _fileStorage = fileStorage;
    }

    public Task<IntakeFormOptionsDto> GetFormOptionsAsync()
    {
        return Task.FromResult(new IntakeFormOptionsDto
        {
            ConsultationPreferences = ConsultationPreferenceOptions.ToList(),
            TimeSlots = TimeSlotOptions.ToList(),
            HowDidYouFindUsOptions = HowDidYouFindUsOptions.ToList()
        });
    }

    public async Task<List<IntakeGroupOptionDto>> GetCatalogAsync()
    {
        var groups = await _db.IntakeGroups
            .OrderBy(g => g.SortOrder)
            .ToListAsync();

        var services = await _db.IntakeServices.ToListAsync();

        return groups.Select(g => new IntakeGroupOptionDto
        {
            Id = g.Id,
            Category = g.Category,
            Name = g.Name,
            Services = services
                .Where(s => s.GroupId == g.Id)
                .Select(s => new IntakeServiceOptionDto { Id = s.Id, Name = s.Name })
                .ToList()
        }).ToList();
    }

    public async Task<IntakeSubmissionResultDto> SubmitAsync(CreateIntakeSubmissionDto dto, Stream? fileStream, string? fileName, string? contentType)
    {
        if (dto.SelectedServiceIds.Count == 0)
            throw new InvalidOperationException("Please select at least one service.");

        var year = DateTime.UtcNow.Year;
        var countThisYear = await _db.IntakeSubmissions.CountAsync(s => s.CreatedAt.Year == year);
        var trackingNumber = $"INQ-{year}-{(countThisYear + 1):D4}";

        var submission = new IntakeSubmission
        {
            TrackingNumber = trackingNumber,
            ClientType = dto.ClientType,
            ClientName = dto.ClientName,
            Industry = dto.Industry,
            Address = dto.Address,
            Country = dto.Country,
            NumberOfEmployees = dto.NumberOfEmployees,
            ContactPerson = dto.ContactPerson,
            Designation = dto.Designation,
            ContactEmail = dto.ContactEmail,
            ContactPhone = dto.ContactPhone,
            ConsultationPreference = dto.ConsultationPreference,
            ConsultationDate = DateTime.SpecifyKind(dto.ConsultationDate, DateTimeKind.Utc),
            PreferredTimeSlots = dto.PreferredTimeSlots.Count > 0 ? string.Join(", ", dto.PreferredTimeSlots) : null,
            ClientConcerns = dto.ClientConcerns,
            HowDidYouFindUs = dto.HowDidYouFindUs,
            Status = "New"
        };

        if (fileStream is not null && fileName is not null && contentType is not null)
        {
            var uploadResult = await _fileStorage.UploadFileAsync(fileStream, fileName, contentType);
            if (uploadResult is not null)
            {
                submission.SupportingDocumentUrl = uploadResult.Value.url;
                submission.SupportingDocumentFileName = fileName;
            }
        }

        _db.IntakeSubmissions.Add(submission);
        await _db.SaveChangesAsync();

        foreach (var serviceId in dto.SelectedServiceIds.Distinct())
        {
            _db.IntakeSubmissionServices.Add(new IntakeSubmissionService
            {
                SubmissionId = submission.Id,
                ServiceId = serviceId
            });
        }
        await _db.SaveChangesAsync();

        await NotifyRecipientsAsync(submission, dto.SelectedServiceIds);
        await NotifyInquirerAsync(submission);

        return new IntakeSubmissionResultDto { Id = submission.Id, TrackingNumber = trackingNumber };
    }

    private async Task NotifyRecipientsAsync(IntakeSubmission submission, List<Guid> selectedServiceIds)
    {
        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var services = await _db.IntakeServices
            .Include(s => s.Group)
            .Where(s => selectedServiceIds.Contains(s.Id))
            .ToListAsync();

        // Group the selected services by recipient email so each person gets ONE email
        // listing every service they're responsible for in this submission, not one email per service.
        var recipientToServices = new Dictionary<string, List<string>>();

        foreach (var service in services)
        {
            var emails = service.Group.RecipientEmails
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            foreach (var email in emails)
            {
                if (!recipientToServices.ContainsKey(email))
                    recipientToServices[email] = new List<string>();

                recipientToServices[email].Add($"{service.Group.Name} — {service.Name}");
            }
        }

        var subject = $"New Inquiry {submission.TrackingNumber} — {submission.ClientName}";

        var testBanner = IsTestMode
            ? $@"<div style=""background:#FEF3C7;border:1px solid #F59E0B;border-radius:8px;padding:14px 16px;margin-bottom:16px;"">
                    <p style=""margin:0;font-weight:700;color:#92400E;font-size:13px;"">⚠️ THIS IS A TEST EMAIL</p>
                    <p style=""margin:6px 0 0;color:#78350F;font-size:13px;line-height:1.5;"">
                        We're currently testing the new client inquiry system. No action is required on your end other than
                        confirming you received this — please send Ms. Cheska Santiago a quick message
                        or a screenshot showing this email so we can confirm delivery worked correctly. Thank you for helping us test!
                    </p>
                </div>"
            : "";

        foreach (var (email, serviceNames) in recipientToServices)
        {
            var bodyHtml = testBanner
                + EmailTemplateBuilder.InfoRow("Tracking Number", submission.TrackingNumber)
                + EmailTemplateBuilder.InfoRow("Client Name", submission.ClientName)
                + EmailTemplateBuilder.InfoRow("Client Type", submission.ClientType)
                + EmailTemplateBuilder.InfoRow("Contact Person", $"{submission.ContactPerson} ({submission.Designation})")
                + EmailTemplateBuilder.InfoRow("Address", submission.Address)
                + (string.IsNullOrWhiteSpace(submission.ContactEmail) ? "" : EmailTemplateBuilder.InfoRow("Contact Email", submission.ContactEmail))
                + (string.IsNullOrWhiteSpace(submission.ContactPhone) ? "" : EmailTemplateBuilder.InfoRow("Contact Phone", submission.ContactPhone))
                + EmailTemplateBuilder.InfoRow("Services Requested (from you)", string.Join("; ", serviceNames))
                + EmailTemplateBuilder.InfoRow("Consultation Preference", submission.ConsultationPreference)
                + EmailTemplateBuilder.InfoRow("Consultation Date", submission.ConsultationDate.ToString("MMM d, yyyy"))
                + (string.IsNullOrWhiteSpace(submission.PreferredTimeSlots) ? "" : EmailTemplateBuilder.InfoRow("Preferred Time", submission.PreferredTimeSlots))
                + (string.IsNullOrWhiteSpace(submission.ClientConcerns) ? "" : EmailTemplateBuilder.InfoRow("Client Concerns", submission.ClientConcerns))
                + (string.IsNullOrWhiteSpace(submission.SupportingDocumentUrl) ? "" : $@"<p style=""margin:12px 0 4px;""><a href=""{submission.SupportingDocumentUrl}"">View Supporting Document</a></p>");

            var html = EmailTemplateBuilder.Build("New Client Inquiry", bodyHtml, null, null);

            await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, email, subject, html);
            await Task.Delay(1500);
        }
    }

    private async Task NotifyInquirerAsync(IntakeSubmission submission)
    {
        if (string.IsNullOrWhiteSpace(submission.ContactEmail)) return;

        var setting = await _db.LeaveNotificationSettings.Include(s => s.SmtpSender).FirstOrDefaultAsync();
        if (setting is null) return;

        var subject = $"We've received your inquiry — {submission.TrackingNumber}";

        var testBanner = IsTestMode
            ? $@"<div style=""background:#FEF3C7;border:1px solid #F59E0B;border-radius:8px;padding:14px 16px;margin-bottom:16px;"">
                    <p style=""margin:0;font-weight:700;color:#92400E;font-size:13px;"">⚠️ THIS IS A TEST EMAIL</p>
                    <p style=""margin:6px 0 0;color:#78350F;font-size:13px;line-height:1.5;"">
                        We're currently testing the new client inquiry system. No action is required on your end other than
                        confirming you received this — please reply to this email, or send Ms. Cheska Santiago a quick message
                        or a screenshot showing this email so we can confirm delivery worked correctly. Thank you for helping us test!
                    </p>
                </div>"
            : "";

        var bodyHtml = testBanner
            + EmailTemplateBuilder.InfoRow("Tracking Number", submission.TrackingNumber)
            + EmailTemplateBuilder.InfoRow("Client Name", submission.ClientName)
            + EmailTemplateBuilder.InfoRow("Consultation Preference", submission.ConsultationPreference)
            + EmailTemplateBuilder.InfoRow("Consultation Date", submission.ConsultationDate.ToString("MMM d, yyyy"))
            + $@"<p style=""margin:12px 0 4px;"">Thank you for reaching out to Sadsad Tamesis Legal and Accountancy Firm. We've received your inquiry and a member of our team will get back to you shortly.</p>"
            + $@"<p style=""margin:12px 0 4px;"">Please keep your tracking number for reference: <strong>{submission.TrackingNumber}</strong></p>";

        var html = EmailTemplateBuilder.Build("Inquiry Received", bodyHtml, null, null);

        await _emailSender.SendAsync(setting.SmtpSender.Email, setting.SmtpSender.AppPasswordValue, submission.ContactEmail, subject, html);
    }
}