namespace STLAF.Api.Departments.IT.DTOs;

public class TicketDto
{
    public Guid Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CompanyEmail { get; set; } = string.Empty;
    public string? ViberNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public Guid? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
    public DateTime DateSubmitted { get; set; }
    public DateTime UpdatedDate { get; set; }
}

public class CreateTicketDto
{
    public string Name { get; set; } = string.Empty;
    public string CompanyEmail { get; set; } = string.Empty;
    public string? ViberNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
}

public class TicketSummaryDto
{
    public int Open { get; set; }
    public int InProgress { get; set; }
    public int OnHold { get; set; }
    public int Resolved { get; set; }
    public int Closed { get; set; }
}

public class UpdateTicketStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class AssignTicketDto
{
    public Guid? AssignedToId { get; set; }
}

public class ItStaffDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
}

public class EmployeeTicketProfileDto
{
    public string FullName { get; set; } = string.Empty;
    public string CompanyEmail { get; set; } = string.Empty;
    public string? ViberNumber { get; set; }
    public string Department { get; set; } = string.Empty;
}

public class CreatePortalTicketDto
{
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}