namespace STLAF.Api.Common.Entities;

public class DocumentRequest : BaseEntity
{
    public string TrackingNumber { get; set; } = string.Empty;

    public Guid EmployeeId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string? DocumentLink { get; set; }
    public string? FileObjectKey { get; set; }
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }

    // PendingEA, RejectedByEA, PendingPartner, Approved, ReturnedToEA, RejectedByPartner
    public string Status { get; set; } = "PendingEA";

    public Guid? EaDecidedByEmployeeId { get; set; }
    public string? EaDecisionNotes { get; set; }
    public DateTime? EaDecidedAt { get; set; }

    public Guid? PartnerDecidedByEmployeeId { get; set; }
    public string? PartnerDecisionNotes { get; set; }
    public DateTime? PartnerDecidedAt { get; set; }
    public DateTime? DeadlineDate { get; set; }
}