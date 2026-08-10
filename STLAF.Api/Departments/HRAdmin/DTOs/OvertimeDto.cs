namespace STLAF.Api.Departments.HRAdmin.DTOs;

public class OvertimePartnerDto
{
    public Guid Id { get; set; }
    public string Department { get; set; } = string.Empty;
    public Guid PartnerEmployeeId { get; set; }
    public string PartnerName { get; set; } = string.Empty;
}

public class SetOvertimePartnerDto
{
    public string Department { get; set; } = string.Empty;
    public Guid PartnerEmployeeId { get; set; }
}

public class OvertimeRequestDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public double Hours { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? DeptDecidedByName { get; set; }
    public string? DeptDecisionNotes { get; set; }
    public DateTime? DeptDecidedAt { get; set; }
    public string? PartnerDecidedByName { get; set; }
    public string? PartnerDecisionNotes { get; set; }
    public DateTime? PartnerDecidedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateOvertimeRequestDto
{
    public DateTime Date { get; set; }
    public string StartTime { get; set; } = string.Empty; // "HH:mm"
    public string EndTime { get; set; } = string.Empty;   // "HH:mm"
    public string Reason { get; set; } = string.Empty;
}

public class DecideOvertimeDto
{
    public bool Approved { get; set; }
    public string? Notes { get; set; }
}