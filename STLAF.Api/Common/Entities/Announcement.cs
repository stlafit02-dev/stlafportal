namespace STLAF.Api.Common.Entities;

public class Announcement : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? Department { get; set; } // null = firm-wide
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public Guid? CreatedBy { get; set; }
}