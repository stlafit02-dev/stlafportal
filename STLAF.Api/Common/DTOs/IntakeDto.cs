namespace STLAF.Api.Common.DTOs;

public class IntakeServiceOptionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class IntakeGroupOptionDto
{
    public Guid Id { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<IntakeServiceOptionDto> Services { get; set; } = new();
}

public class CreateIntakeSubmissionDto
{
    // Step 1 — Client Info
    public string ClientType { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string? NumberOfEmployees { get; set; }
    public string ContactPerson { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;

    // Step 2 — Services Wanted
    public List<Guid> SelectedServiceIds { get; set; } = new();

    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }

    // Step 3 — Details & Booking
    public string ConsultationPreference { get; set; } = string.Empty;
    public DateTime ConsultationDate { get; set; }
    public List<string> PreferredTimeSlots { get; set; } = new();
    public string? ClientConcerns { get; set; }
    public string HowDidYouFindUs { get; set; } = string.Empty;
}

public class IntakeSubmissionResultDto
{
    public Guid Id { get; set; }
    public string TrackingNumber { get; set; } = string.Empty;
}
public class IntakeFormOptionsDto
{
    public List<string> ConsultationPreferences { get; set; } = new();
    public List<string> TimeSlots { get; set; } = new();
    public List<string> HowDidYouFindUsOptions { get; set; } = new();
}