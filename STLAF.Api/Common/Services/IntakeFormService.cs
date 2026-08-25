using Microsoft.EntityFrameworkCore;
using STLAF.Api.Common.DTOs;
using STLAF.Api.Common.Email;
using STLAF.Api.Common.Entities;
using STLAF.Api.Data;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

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
    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

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
    public async Task<List<IntakeSubmissionSummaryDto>> GetMySubmissionsAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return new List<IntakeSubmissionSummaryDto>();

        var hasFullAccess = await _db.IntakeFullAccessGrants
            .AnyAsync(g => g.CompanyId == employee.CompanyId);

        if (hasFullAccess)
        {
            var allSubmissionServices = await _db.IntakeSubmissionServices
                .Include(ss => ss.Submission)
                .Include(ss => ss.Service).ThenInclude(s => s.Group)
                .ToListAsync();

            return allSubmissionServices
                .GroupBy(ss => ss.SubmissionId)
                .Select(g =>
                {
                    var submission = g.First().Submission;
                    return new IntakeSubmissionSummaryDto
                    {
                        Id = submission.Id,
                        TrackingNumber = submission.TrackingNumber,
                        ClientName = submission.ClientName,
                        ClientType = submission.ClientType,
                        ContactPerson = submission.ContactPerson,
                        ContactEmail = submission.ContactEmail,
                        ContactPhone = submission.ContactPhone,
                        Status = submission.Status,
                        CreatedAt = submission.CreatedAt,
                        ConsultationDate = submission.ConsultationDate,
                        ConsultationPreference = submission.ConsultationPreference,
                        MatchedServices = g.Select(ss => ss.Service.Name).ToList(),
                        Categories = g.Select(ss => ss.Service.Group.Category).Distinct().ToList()
                    };
                })
                .OrderByDescending(r => r.CreatedAt)
                .ToList();
        }

        if (string.IsNullOrWhiteSpace(employee.CompanyEmail))
            return new List<IntakeSubmissionSummaryDto>();

        var myEmail = NormalizeEmail(employee.CompanyEmail);

        var allGroups = await _db.IntakeGroups.ToListAsync();
        var myGroupIds = allGroups
            .Where(g => g.RecipientEmails
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(NormalizeEmail)
                .Contains(myEmail))
            .Select(g => g.Id)
            .ToHashSet();

        if (myGroupIds.Count == 0) return new List<IntakeSubmissionSummaryDto>();

        var myServiceIds = await _db.IntakeServices
            .Where(s => myGroupIds.Contains(s.GroupId))
            .Select(s => s.Id)
            .ToListAsync();

        var relevant = await _db.IntakeSubmissionServices
            .Where(ss => myServiceIds.Contains(ss.ServiceId))
            .Include(ss => ss.Submission)
            .Include(ss => ss.Service)
            .ToListAsync();

        return relevant
            .GroupBy(ss => ss.SubmissionId)
            .Select(g =>
            {
                var submission = g.First().Submission;
                return new IntakeSubmissionSummaryDto
                {
                    Id = submission.Id,
                    TrackingNumber = submission.TrackingNumber,
                    ClientName = submission.ClientName,
                    ClientType = submission.ClientType,
                    ContactPerson = submission.ContactPerson,
                    ContactEmail = submission.ContactEmail,
                    ContactPhone = submission.ContactPhone,
                    Status = submission.Status,
                    CreatedAt = submission.CreatedAt,
                    ConsultationDate = submission.ConsultationDate,
                    ConsultationPreference = submission.ConsultationPreference,
                    MatchedServices = g.Select(ss => ss.Service.Name).ToList(),
                    Categories = g.Select(ss => ss.Service.Group.Category).Distinct().ToList()
                };
            })
            .OrderByDescending(r => r.CreatedAt)
            .ToList();
    }
    public async Task<bool> IsPointPersonAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return false;

        var hasFullAccess = await _db.IntakeFullAccessGrants
            .AnyAsync(g => g.CompanyId == employee.CompanyId);
        if (hasFullAccess) return true;

        if (string.IsNullOrWhiteSpace(employee.CompanyEmail)) return false;

        var myEmail = NormalizeEmail(employee.CompanyEmail);

        var allGroups = await _db.IntakeGroups.ToListAsync();
        return allGroups.Any(g => g.RecipientEmails
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(NormalizeEmail)
            .Contains(myEmail));
    }
    private async Task<HashSet<Guid>?> GetMatchedServiceIdsForUserAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return null;

        var hasFullAccess = await _db.IntakeFullAccessGrants.AnyAsync(g => g.CompanyId == employee.CompanyId);
        if (hasFullAccess) return null; // null = no restriction, include everything

        if (string.IsNullOrWhiteSpace(employee.CompanyEmail)) return new HashSet<Guid>();
        var myEmail = NormalizeEmail(employee.CompanyEmail);

        var allGroups = await _db.IntakeGroups.ToListAsync();
        var myGroupIds = allGroups
            .Where(g => g.RecipientEmails.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(NormalizeEmail).Contains(myEmail))
            .Select(g => g.Id)
            .ToHashSet();

        if (myGroupIds.Count == 0) return new HashSet<Guid>();

        var myServiceIds = await _db.IntakeServices
            .Where(s => myGroupIds.Contains(s.GroupId))
            .Select(s => s.Id)
            .ToListAsync();

        return myServiceIds.ToHashSet();
    }
    public async Task<bool> CanAccessSubmissionAsync(Guid userId, Guid submissionId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return false;

        var hasFullAccess = await _db.IntakeFullAccessGrants.AnyAsync(g => g.CompanyId == employee.CompanyId);
        if (hasFullAccess) return true;

        if (string.IsNullOrWhiteSpace(employee.CompanyEmail)) return false;
        var myEmail = NormalizeEmail(employee.CompanyEmail);

        var allGroups = await _db.IntakeGroups.ToListAsync();
        var myGroupIds = allGroups
            .Where(g => g.RecipientEmails.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(NormalizeEmail).Contains(myEmail))
            .Select(g => g.Id)
            .ToHashSet();

        if (myGroupIds.Count == 0) return false;

        var myServiceIds = await _db.IntakeServices.Where(s => myGroupIds.Contains(s.GroupId)).Select(s => s.Id).ToListAsync();

        return await _db.IntakeSubmissionServices
            .AnyAsync(ss => ss.SubmissionId == submissionId && myServiceIds.Contains(ss.ServiceId));
    }
    public async Task<byte[]?> GenerateProposalAsync(Guid submissionId, Guid userId)
    {
        var submission = await _db.IntakeSubmissions.FirstOrDefaultAsync(s => s.Id == submissionId);
        if (submission is null) return null;

        var matchedServiceIds = await GetMatchedServiceIdsForUserAsync(userId);
        if (matchedServiceIds is not null && matchedServiceIds.Count == 0) return null;

        var servicesQuery = _db.IntakeSubmissionServices
            .Where(ss => ss.SubmissionId == submissionId)
            .Include(ss => ss.Service)
            .AsQueryable();

        if (matchedServiceIds is not null)
        {
            servicesQuery = servicesQuery.Where(ss => matchedServiceIds.Contains(ss.ServiceId));
        }

        var services = await servicesQuery.Select(ss => ss.Service.Name).ToListAsync();
        if (services.Count == 0) return null;

        using var stream = new MemoryStream();
        using (var doc = WordprocessingDocument.Create(stream, WordprocessingDocumentType.Document))
        {
            var mainPart = doc.AddMainDocumentPart();
            mainPart.Document = new Document();
            var body = mainPart.Document.AppendChild(new Body());

            void AddParagraph(string text, bool bold = false, JustificationValues? align = null, int sizeHalfPoints = 22)
            {
                var run = new Run(new Text(text) { Space = SpaceProcessingModeValues.Preserve });
                var rPr = new RunProperties(new RunFonts { Ascii = "Calibri" }, new FontSize { Val = sizeHalfPoints.ToString() });
                if (bold) rPr.AppendChild(new Bold());
                run.PrependChild(rPr);

                var para = new Paragraph(run);
                var pPr = new ParagraphProperties();
                if (align.HasValue) pPr.Justification = new Justification { Val = align.Value };
                pPr.SpacingBetweenLines = new SpacingBetweenLines { After = "200" };
                para.PrependChild(pPr);

                body.AppendChild(para);
            }

            void AddBullet(string text)
            {
                var run = new Run(new Text($"•  {text}") { Space = SpaceProcessingModeValues.Preserve });
                run.PrependChild(new RunProperties(new RunFonts { Ascii = "Calibri" }, new FontSize { Val = "22" }));
                var para = new Paragraph(run);
                para.PrependChild(new ParagraphProperties(new Indentation { Left = "360" }, new SpacingBetweenLines { After = "120" }));
                body.AppendChild(para);
            }

            AddParagraph(submission.ClientName, bold: true, sizeHalfPoints: 24);
            AddParagraph(submission.ContactPerson);
            AddParagraph(submission.Designation);
            AddParagraph(submission.Address);
            AddParagraph("");
            AddParagraph(DateTime.UtcNow.ToString("MMMM d, yyyy"));
            AddParagraph("");
            AddParagraph($"PROPOSAL TO PROVIDE LEGAL AND ADVISORY ASSISTANCE — {string.Join(", ", services).ToUpper()}", bold: true);
            AddParagraph("");
            AddParagraph($"Dear {submission.ContactPerson},");
            AddParagraph("");
            AddParagraph("Thank you for considering Sadsad Tamesis Legal and Accountancy Firm (STLAF) to provide you with our legal services. At STLAF, we pride ourselves on delivering more than just legal counsel and numerical analysis. Our approach emphasizes providing insights that transcend mere legalities and financial figures, ensuring our services' highest quality and excellence.");
            AddParagraph($"We are pleased to submit this proposal to you to provide legal and advisory assistance on the following matter(s):");
            AddParagraph("");
            AddParagraph("Scope of Services", bold: true);

            foreach (var service in services)
            {
                AddBullet(service);
            }

            AddParagraph("");
            AddParagraph("Fee Arrangement", bold: true);
            AddParagraph("Our usual professional fees are a function of the time required to carry out the engagement. All professional fees shall be exclusive of VAT and withholding taxes.");
            AddParagraph("[ FEE SCHEDULE TO BE COMPLETED BY ASSIGNED PARTNER/STAFF BEFORE SENDING ]", bold: true);
            AddParagraph("");
            AddParagraph("We shall send you our billings every fifth (5th) day of each month and expect payment from you no later than the tenth (10th) day of the same month, or five (5) days from the date of billing.");
            AddParagraph("If your account is not paid within the 5-day limit, following our firm's policy, the firm's management will insist that no further work be done on your file until the account is paid and your retainer is brought up to date.");
            AddParagraph("All indirect expenses shall be for the account of the client. Messengerial expenses shall likewise be for the account of the client, fixed at Php 1,000.00 within Metro Manila and Php 1,500.00 outside Metro Manila per day of legwork.");
            AddParagraph("");
            AddParagraph("You may rest assured that we will exert our best efforts to complete the engagement most professionally and expeditiously, consistent with our desire to provide distinguished services.");
            AddParagraph("");
            AddParagraph("Sincerely yours,");
            AddParagraph("");
            AddParagraph("");
            AddParagraph("_______________________________", bold: false);
            AddParagraph("[ PARTNER NAME ]", bold: true);
            AddParagraph("Partner");
            AddParagraph("");
            AddParagraph("---");
            AddParagraph("");
            AddParagraph("ACCEPTANCE AND CONFORMITY", bold: true);
            AddParagraph("I have read and hereby accept the terms of this engagement letter.");
            AddParagraph("");
            AddParagraph("……………………………………");
            AddParagraph(submission.ContactPerson);
            AddParagraph("");
            AddParagraph("……………………………………");
            AddParagraph("Date Signed");
        }

        return stream.ToArray();
    }
}