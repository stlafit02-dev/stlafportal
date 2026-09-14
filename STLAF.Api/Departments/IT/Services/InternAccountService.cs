using Microsoft.EntityFrameworkCore;
using STLAF.Api.Data;
using STLAF.Api.Departments.HRAdmin.Entities;
using STLAF.Api.Departments.IT.DTOs;
using STLAF.Api.Identity.Entities;

namespace STLAF.Api.Departments.IT.Services;

public class InternAccountService : IInternAccountService
{
    private const string InternCategoryName = "Intern";

    private readonly AppDbContext _db;

    public InternAccountService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<InternAccountDto>> GetInternsAsync()
    {
        var interns = await _db.Employees
            .Include(e => e.User)
            .Where(e => e.Category.Name == InternCategoryName)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        return interns.Select(ToDto).ToList();
    }

    public async Task<InternAccountDto> CreateInternAsync(CreateInternAccountDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        ValidateEmail(email);
        ValidatePassword(dto.Password);

        var emailTaken = await _db.Users.AnyAsync(u => u.Email == email || u.Username == email);
        if (emailTaken)
        {
            throw new InvalidOperationException("An account with this email already exists.");
        }

        var department = await _db.Departments.FirstOrDefaultAsync(d => d.Name == "IT")
            ?? throw new InvalidOperationException("IT department not found.");
        var employeeRole = await _db.Roles.FirstAsync(r => r.Name == "Employee");
        var category = await GetOrCreateInternCategoryAsync();

        var year = DateTime.UtcNow.Year;
        var yy = year % 100;
        var totalEmployeeCount = await _db.Employees.CountAsync();
        var companyId = $"{yy:D2}-{category.Code}{(totalEmployeeCount + 1):D4}";

        var idAlreadyTaken = await _db.Users.AnyAsync(u => u.Username == companyId)
            || await _db.Employees.AnyAsync(e => e.CompanyId == companyId);
        if (idAlreadyTaken)
        {
            throw new InvalidOperationException($"Generated Company ID {companyId} is already in use. Please try again.");
        }

        var user = new User
        {
            Email = email,
            Username = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FullName = email.Split('@')[0],
            DepartmentId = department.Id,
            RoleId = employeeRole.Id,
            IsActive = true
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var employee = new Employee
        {
            CompanyId = companyId,
            CategoryId = category.Id,
            FirstName = user.FullName,
            LastName = string.Empty,
            Sex = string.Empty,
            Bday = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc),
            Nationality = string.Empty,
            Department = "IT",
            OfficePosition = $"Intern-{companyId}",
            CompanyEmail = email,
            StartDate = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc),
            Status = "Active",
            UserId = user.Id
        };
        _db.Employees.Add(employee);
        await _db.SaveChangesAsync();

        employee.User = user;
        return ToDto(employee);
    }

    public async Task<InternAccountDto?> UpdateInternAsync(Guid id, UpdateInternAccountDto dto)
    {
        var employee = await _db.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id && e.Category.Name == InternCategoryName);

        if (employee is null || employee.User is null) return null;

        var email = dto.Email.Trim().ToLowerInvariant();
        ValidateEmail(email);

        if (email != employee.User.Email)
        {
            var emailTaken = await _db.Users.AnyAsync(u => u.Id != employee.User.Id && (u.Email == email || u.Username == email));
            if (emailTaken)
            {
                throw new InvalidOperationException("An account with this email already exists.");
            }

            employee.User.Email = email;
            employee.User.Username = email;
            employee.CompanyEmail = email;
        }

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            ValidatePassword(dto.Password);
            employee.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        employee.Status = dto.Status;
        employee.User.IsActive = dto.Status == "Active";

        await _db.SaveChangesAsync();
        return ToDto(employee);
    }

    private async Task<EmployeeCategory> GetOrCreateInternCategoryAsync()
    {
        var category = await _db.EmployeeCategories.FirstOrDefaultAsync(c => c.Name == InternCategoryName);
        if (category is not null) return category;

        var maxCode = await _db.EmployeeCategories.AnyAsync()
            ? await _db.EmployeeCategories.MaxAsync(c => c.Code)
            : 0;

        var candidate = new EmployeeCategory { Name = InternCategoryName, Code = maxCode + 1 };
        _db.EmployeeCategories.Add(candidate);

        try
        {
            await _db.SaveChangesAsync();
            return candidate;
        }
        catch (DbUpdateException)
        {
            _db.Entry(candidate).State = EntityState.Detached;
            return await _db.EmployeeCategories.FirstOrDefaultAsync(c => c.Name == InternCategoryName)
                ?? throw new InvalidOperationException("Unable to create the Intern employee category. Please try again.");
        }
    }

    private static void ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@') || !email.Contains('.'))
        {
            throw new InvalidOperationException("Please enter a valid email address.");
        }
    }

    private static void ValidatePassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 6)
        {
            throw new InvalidOperationException("Password must be at least 6 characters.");
        }
    }

    private static InternAccountDto ToDto(Employee e) => new()
    {
        Id = e.Id,
        CompanyId = e.CompanyId,
        Email = e.User?.Email ?? e.CompanyEmail ?? string.Empty,
        Status = e.Status,
        CreatedAt = e.CreatedAt
    };
}
