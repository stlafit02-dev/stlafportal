namespace STLAF.Api.Common.Entities;

public class IntakeSubmissionService : BaseEntity
{
    public Guid SubmissionId { get; set; }
    public IntakeSubmission Submission { get; set; } = null!;

    public Guid ServiceId { get; set; }
    public IntakeService Service { get; set; } = null!;
}