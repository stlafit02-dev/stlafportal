using STLAF.Api.Common.Entities;

namespace STLAF.Api.Departments.IT.Entities;

public class AppPassword : BaseEntity
{
    public Guid GwsAccountId { get; set; }
    public GwsAccount GwsAccount { get; set; } = null!;
    public string AppPasswordValue { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public string? Notes { get; set; }
}