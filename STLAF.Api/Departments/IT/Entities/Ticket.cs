using STLAF.Api.Common.Entities;

namespace STLAF.Api.Departments.IT.Entities;

public class Ticket : BaseEntity
{
    public string TicketNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CompanyEmail { get; set; } = string.Empty;
    public string? ViberNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = "Open";
    public string Department { get; set; } = string.Empty; // requester's department
    public Guid? AssignedTo { get; set; } // IT staff user, nullable — wired up in Phase 3b
    public Guid? SubmittedByEmployeeId { get; set; }
    public DateTime DateSubmitted { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
}