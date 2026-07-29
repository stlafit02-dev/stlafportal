using STLAF.Api.Common.Entities;

namespace STLAF.Api.Departments.IT.Entities;

public class EmailAccount : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string LocalGmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string StlafEmail { get; set; } = string.Empty;
    public string? OldUser { get; set; }
    public string Status { get; set; } = "Active";
    public Guid GwsAccountId { get; set; }
    public GwsAccount GwsAccount { get; set; } = null!;
    public string? Remarks { get; set; }
    public bool Deleted { get; set; }
    public DateTime? DeleteAt { get; set; }
    public string? UpdatedBy { get; set; }
    public string? OldStlafEmail { get; set; }
    public bool Recycled { get; set; }
    public DateTime? RecycledAt { get; set; }
}