namespace STLAF.Api.Common.Entities;

public class IntakeService : BaseEntity
{
    public Guid GroupId { get; set; }
    public IntakeGroup Group { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
}