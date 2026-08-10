using STLAF.Api.Common.Entities;

namespace STLAF.Api.Departments.HRAdmin.Entities;

public class LeaveApprover : BaseEntity
{
    public string Department { get; set; } = string.Empty;
    public Guid ApproverEmployeeId { get; set; }
    public Employee ApproverEmployee { get; set; } = null!;
}