using STLAF.Api.Common.Entities;
using STLAF.Api.Identity.Entities;

namespace STLAF.Api.Departments.HRAdmin.Entities;

public class Employee : BaseEntity
{
    public string CompanyId { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public EmployeeCategory Category { get; set; } = null!;

    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string? MobileNumber { get; set; }
    public int Age { get; set; }
    public string Sex { get; set; } = string.Empty;
    public DateTime Bday { get; set; }
    public string Nationality { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string OfficePosition { get; set; } = string.Empty;
    public string? PersonalEmail { get; set; }
    public string? CompanyEmail { get; set; }
    public DateTime StartDate { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactNumber { get; set; }
    public string Status { get; set; } = "Active";

    public Guid? UserId { get; set; }
    public User? User { get; set; }
}