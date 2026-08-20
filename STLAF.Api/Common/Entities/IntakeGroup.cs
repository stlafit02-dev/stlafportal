namespace STLAF.Api.Common.Entities;

public class IntakeGroup : BaseEntity
{
    public string Category { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string RecipientEmails { get; set; } = string.Empty; // comma-separated
    public int SortOrder { get; set; }
}