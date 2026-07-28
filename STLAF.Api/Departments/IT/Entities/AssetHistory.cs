using STLAF.Api.Common.Entities;

namespace STLAF.Api.Departments.IT.Entities;

public class AssetHistory : BaseEntity
{
    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;
    public string PartComponent { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public DateTime? DatePurchased { get; set; }
    public DateTime DateOfReplacement { get; set; }
    public string? Notes { get; set; }
}