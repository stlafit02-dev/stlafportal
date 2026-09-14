using STLAF.Api.Common.Entities;

namespace STLAF.Api.ClientPortal.Entities;

public class GeneratedDocument : BaseEntity
{
    public Guid SubmissionId { get; set; }
    public Submission Submission { get; set; } = null!;

    public string FileKey { get; set; } = string.Empty;
}
