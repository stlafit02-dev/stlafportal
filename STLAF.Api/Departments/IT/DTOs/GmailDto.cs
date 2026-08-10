namespace STLAF.Api.Departments.IT.DTOs;

public class GwsAccountDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int MaxCapacity { get; set; }
    public int ActiveCount { get; set; }
    public int InactiveCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateGwsAccountDto
{
    public string Name { get; set; } = string.Empty;
    public int MaxCapacity { get; set; }
}

public class UpdateGwsAccountDto
{
    public string Name { get; set; } = string.Empty;
    public int MaxCapacity { get; set; }
}

public class EmailAccountDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string LocalGmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string StlafEmail { get; set; } = string.Empty;
    public string? OldUser { get; set; }
    public string? OldStlafEmail { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid GwsAccountId { get; set; }
    public string GwsAccountName { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public bool Recycled { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateEmailAccountDto
{
    public string FullName { get; set; } = string.Empty;
    public string? OldUser { get; set; }
    public string LocalGmail { get; set; } = string.Empty;
    public string StlafEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public Guid GwsAccountId { get; set; }
    public string? Remarks { get; set; }
}

public class UpdateEmailAccountDto
{
    public string FullName { get; set; } = string.Empty;
    public string? OldUser { get; set; }
    public string Password { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Remarks { get; set; }
}

public class RecycleEmailAccountDto
{
    public string NewFullName { get; set; } = string.Empty;
    public string NewStlafEmail { get; set; } = string.Empty;
}

public class AppPasswordDto
{
    public Guid Id { get; set; }
    public Guid GwsAccountId { get; set; }
    public string GwsAccountName { get; set; } = string.Empty;
    public string AppPasswordValue { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty; // "Active" | "Expired"
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAppPasswordDto
{
    public Guid GwsAccountId { get; set; }
    public string AppPasswordValue { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public string? Notes { get; set; }
}

public class RegisteredEmployeeOptionDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string CompanyId { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
}