using STLAF.Api.Common.Entities;

namespace STLAF.Api.Departments.HRAdmin.Entities;

public class EmployeeCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public int Code { get; set; }
}