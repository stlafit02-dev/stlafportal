using STLAF.Api.Common.Entities;

namespace STLAF.Api.Departments.IT.Entities;

public class GwsAccount : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public int MaxCapacity { get; set; }
}