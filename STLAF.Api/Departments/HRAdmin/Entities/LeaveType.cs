using STLAF.Api.Common.Entities;

namespace STLAF.Api.Departments.HRAdmin.Entities;

public class LeaveType : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public decimal DefaultCredits { get; set; }
    public int? RequiresMedicalAfterDays { get; set; }
}