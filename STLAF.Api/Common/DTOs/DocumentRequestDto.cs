namespace STLAF.Api.Common.DTOs;

public class DocumentReviewerDto
{
    public Guid Id { get; set; }
    public string Role { get; set; } = string.Empty;
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
}

public class AddDocumentReviewerDto
{
    public string Role { get; set; } = string.Empty;
    public Guid EmployeeId { get; set; }
}

public class DocumentRequestDto
{
    public Guid Id { get; set; }
    public string TrackingNumber { get; set; } = string.Empty;
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string? DocumentLink { get; set; }
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? EaDecidedByName { get; set; }
    public string? EaDecisionNotes { get; set; }
    public DateTime? EaDecidedAt { get; set; }
    public string? PartnerDecidedByName { get; set; }
    public string? PartnerDecisionNotes { get; set; }
    public DateTime? PartnerDecidedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DeadlineDate { get; set; }
}

public class CreateDocumentRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public DateTime? DeadlineDate { get; set; }
    public string? DocumentLink { get; set; }
}

public class DecideDocumentRequestDto
{
    public bool Approved { get; set; }
    public string? Notes { get; set; }
}

public class ForwardRejectionDto
{
    // EA confirms they've informed the submitter; no extra fields needed for now.
}