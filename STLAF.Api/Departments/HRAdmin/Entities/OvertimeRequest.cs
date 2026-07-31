using STLAF.Api.Common.Entities;

namespace STLAF.Api.Departments.HRAdmin.Entities;

public class OvertimeRequest : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public DateTime Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public double Hours { get; set; }
    public string Reason { get; set; } = string.Empty;

    // Pending -> PendingPartnerApproval -> Approved / Rejected
    public string Status { get; set; } = "Pending";

    public Guid? DeptDecidedByEmployeeId { get; set; }
    public Employee? DeptDecidedByEmployee { get; set; }
    public string? DeptDecisionNotes { get; set; }
    public DateTime? DeptDecidedAt { get; set; }

    public Guid? PartnerDecidedByEmployeeId { get; set; }
    public Employee? PartnerDecidedByEmployee { get; set; }
    public string? PartnerDecisionNotes { get; set; }
    public DateTime? PartnerDecidedAt { get; set; }
}