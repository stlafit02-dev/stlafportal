using STLAF.Api.Common.Entities;

namespace STLAF.Api.Departments.HRAdmin.Entities;

public class LeaveRequest : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public Guid LeaveTypeId { get; set; }
    public LeaveType LeaveType { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int Days { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public Guid? DecidedByEmployeeId { get; set; }
    public Employee? DecidedByEmployee { get; set; }
    public string? DecisionNotes { get; set; }
    public DateTime? DecidedAt { get; set; }

    public string? RetractionReason { get; set; }
    public DateTime? RetractionRequestedAt { get; set; }
    public Guid? RetractionDecidedByEmployeeId { get; set; }
    public Employee? RetractionDecidedByEmployee { get; set; }
    public string? RetractionDecisionNotes { get; set; }
    public DateTime? RetractionDecidedAt { get; set; }
}