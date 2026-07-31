namespace STLAF.Api.Departments.HRAdmin.DTOs;

public class EmployeeCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Code { get; set; }
}

public class CreateEmployeeCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public int Code { get; set; }
}

public class EmployeeDto
{
    public Guid Id { get; set; }
    public string CompanyId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
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
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateEmployeeDto
{
    public Guid CategoryId { get; set; }
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
    public string CompanyEmail { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public string Status { get; set; } = "Active";
    public string? ManualCompanyId { get; set; }
}

public class CreateEmployeeResultDto
{
    public EmployeeDto Employee { get; set; } = null!;
    public string GeneratedPassword { get; set; } = string.Empty;
}

public class UpdateEmployeeDto
{
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
    public string CompanyEmail { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public string Status { get; set; } = string.Empty;
}