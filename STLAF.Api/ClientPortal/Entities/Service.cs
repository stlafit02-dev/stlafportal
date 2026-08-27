using STLAF.Api.Common.Entities;

namespace STLAF.Api.ClientPortal.Entities;

public class Service : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool IsActive { get; set; } = true;
}
