namespace STLAF.Api.Common.Entities;

public class IntakeSubmission : BaseEntity
{
    public string TrackingNumber { get; set; } = string.Empty;

    // Step 1 — Client Info
    public string ClientType { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string? NumberOfEmployees { get; set; }
    public string ContactPerson { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;

    // Contact details
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }

    // Step 3 — Details & Booking
    public string ConsultationPreference { get; set; } = string.Empty;
    public DateTime ConsultationDate { get; set; }
    public string? PreferredTimeSlots { get; set; } // comma-separated slot labels
    public string? ClientConcerns { get; set; }
    public string? SupportingDocumentUrl { get; set; }
    public string? SupportingDocumentFileName { get; set; }
    public string HowDidYouFindUs { get; set; } = string.Empty;

    public string Status { get; set; } = "New"; // New, Contacted, Closed

    public List<IntakeSubmissionService> SelectedServices { get; set; } = new();
}