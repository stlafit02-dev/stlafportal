namespace STLAF.Api.Departments.IT.DTOs;

public class InternAccountDto
{
    public Guid Id { get; set; }
    public string CompanyId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateInternAccountDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UpdateInternAccountDto
{
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    public string Status { get; set; } = "Active";
}
