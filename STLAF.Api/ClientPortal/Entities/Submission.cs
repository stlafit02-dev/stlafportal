using STLAF.Api.Common.Entities;

namespace STLAF.Api.ClientPortal.Entities;

public class Submission : BaseEntity
{
    public Guid ClientAccountId { get; set; }
    public ClientAccount ClientAccount { get; set; } = null!;

    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;

    public int FormSchemaVersion { get; set; }

    public string ResponsesJson { get; set; } = "{}";

    public string Status { get; set; } = "submitted";
}
