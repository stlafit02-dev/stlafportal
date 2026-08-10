using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using STLAF.Api.Data;
using STLAF.Api.Departments.HRAdmin.DTOs;
using STLAF.Api.Departments.HRAdmin.Entities;
using STLAF.Api.Identity.Entities;
using STLAF.Api.Departments.IT.DTOs;
using STLAF.Api.Departments.IT.Services;

namespace STLAF.Api.Departments.HRAdmin.Services;

public class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _db;
    private readonly ITicketingService _ticketingService;
    private const string PasswordChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

    public EmployeeService(AppDbContext db, ITicketingService ticketingService)
    {
        _db = db;
        _ticketingService = ticketingService;
    }

    public async Task<List<EmployeeCategoryDto>> GetCategoriesAsync()
    {
        return await _db.EmployeeCategories
            .OrderBy(c => c.Code)
            .Select(c => new EmployeeCategoryDto { Id = c.Id, Name = c.Name, Code = c.Code })
            .ToListAsync();
    }

    public async Task<EmployeeCategoryDto> CreateCategoryAsync(CreateEmployeeCategoryDto dto)
    {
        var category = new EmployeeCategory { Name = dto.Name, Code = dto.Code };
        _db.EmployeeCategories.Add(category);
        await _db.SaveChangesAsync();
        return new EmployeeCategoryDto { Id = category.Id, Name = category.Name, Code = category.Code };
    }

    public async Task<List<EmployeeDto>> GetEmployeesAsync()
    {
        var employees = await _db.Employees
            .Include(e => e.Category)
            .Include(e => e.User)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        return employees.Select(ToDto).ToList();
    }

    public async Task<CreateEmployeeResultDto> CreateEmployeeAsync(CreateEmployeeDto dto, string requestedByName, string requestedByEmail)
    {
        var category = await _db.EmployeeCategories.FirstOrDefaultAsync(c => c.Id == dto.CategoryId)
            ?? throw new InvalidOperationException("Category not found.");

        var department = await _db.Departments.FirstOrDefaultAsync(d => d.Name == dto.Department)
            ?? throw new InvalidOperationException("Department not found.");

        var employeeRole = await _db.Roles.FirstAsync(r => r.Name == "Employee");

        string companyId;
        if (!string.IsNullOrWhiteSpace(dto.ManualCompanyId))
        {
            companyId = dto.ManualCompanyId.Trim();
        }
        else
        {
            var year = DateTime.UtcNow.Year;
            var yy = year % 100;
            var totalEmployeeCount = await _db.Employees.CountAsync();
            var sequence = totalEmployeeCount + 1;
            companyId = $"{yy:D2}-{category.Code}{sequence:D4}";
        }

        var idAlreadyTaken = await _db.Users.AnyAsync(u => u.Username == companyId)
            || await _db.Employees.AnyAsync(e => e.CompanyId == companyId);

        if (idAlreadyTaken)
        {
            throw new InvalidOperationException(
                string.IsNullOrWhiteSpace(dto.ManualCompanyId)
                    ? $"Generated Company ID {companyId} is already in use. Please try again."
                    : $"Company ID {companyId} is already assigned to another employee. Please use a different one.");
        }

        const string defaultPassword = "stlaf2026";
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword);

        var fullName = string.Join(" ", new[] { dto.FirstName, dto.MiddleName, dto.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));

        var user = new User
        {
            Email = companyId,
            Username = companyId,
            PasswordHash = passwordHash,
            FullName = fullName,
            DepartmentId = department.Id,
            RoleId = employeeRole.Id,
            IsActive = dto.Status == "Active"
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var employee = new Employee
        {
            CompanyId = companyId,
            CategoryId = dto.CategoryId,
            FirstName = dto.FirstName,
            MiddleName = dto.MiddleName,
            LastName = dto.LastName,
            MobileNumber = dto.MobileNumber,
            Age = dto.Age,
            Sex = dto.Sex,
            Bday = DateTime.SpecifyKind(dto.Bday, DateTimeKind.Utc),
            Nationality = dto.Nationality,
            Department = dto.Department,
            OfficePosition = dto.OfficePosition,
            PersonalEmail = dto.PersonalEmail,
            CompanyEmail = dto.CompanyEmail,
            StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc),
            Status = dto.Status,
            UserId = user.Id
        };

        if (string.IsNullOrWhiteSpace(dto.ManualCompanyId))
        {
            await _ticketingService.CreateAsync(new CreateTicketDto
            {
                Name = requestedByName,
                CompanyEmail = requestedByEmail,
                ViberNumber = null,
                Description = $"Please create email for new employee.\nName: {fullName}\nNumber: {dto.MobileNumber}\nDepartment: {dto.Department}\nOffice Position: {dto.OfficePosition}",
                Category = "Email & Communications",
                Priority = "Urgent",
                Department = dto.Department
            });
        }

        _db.Employees.Add(employee);
        await _db.SaveChangesAsync();

        await _db.Entry(employee).Reference(e => e.Category).LoadAsync();

        return new CreateEmployeeResultDto
        {
            Employee = ToDto(employee),
            GeneratedPassword = defaultPassword
        };
    }

    public async Task<EmployeeDto?> UpdateEmployeeAsync(Guid id, UpdateEmployeeDto dto)
    {
        var employee = await _db.Employees
            .Include(e => e.Category)
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee is null) return null;

        employee.FirstName = dto.FirstName;
        employee.MiddleName = dto.MiddleName;
        employee.LastName = dto.LastName;
        employee.Age = dto.Age;
        employee.Sex = dto.Sex;
        employee.Bday = DateTime.SpecifyKind(dto.Bday, DateTimeKind.Utc);
        employee.Nationality = dto.Nationality;
        employee.Department = dto.Department;
        employee.OfficePosition = dto.OfficePosition;
        employee.PersonalEmail = dto.PersonalEmail;
        employee.CompanyEmail = dto.CompanyEmail;
        employee.MobileNumber = dto.MobileNumber;
        employee.StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
        employee.Status = dto.Status;

        if (employee.User is not null)
        {
            // User.Email/Username stay permanently as the Company ID and are never
            // touched here — Company Email is purely informational and lives only
            // on Employee.CompanyEmail.
            employee.User.FullName = string.Join(" ", new[] { dto.FirstName, dto.MiddleName, dto.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));
            employee.User.IsActive = dto.Status == "Active";

            var department = await _db.Departments.FirstOrDefaultAsync(d => d.Name == dto.Department);
            if (department is not null)
            {
                employee.User.DepartmentId = department.Id;
            }
        }

        await _db.SaveChangesAsync();
        return ToDto(employee);
    }

    public async Task<bool> DeleteEmployeeAsync(Guid id)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id);
        if (employee is null) return false;

        if (employee.UserId.HasValue)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == employee.UserId.Value);
            if (user is not null) _db.Users.Remove(user);
        }

        _db.Employees.Remove(employee);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<string?> GetCompanyEmailForUserAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        return employee?.CompanyEmail;
    }

    private static string GenerateRandomPassword(int length)
    {
        var bytes = RandomNumberGenerator.GetBytes(length);
        var chars = new char[length];
        for (var i = 0; i < length; i++)
        {
            chars[i] = PasswordChars[bytes[i] % PasswordChars.Length];
        }
        return new string(chars);
    }

    private static EmployeeDto ToDto(Employee e) => new()
    {
        Id = e.Id,
        CompanyId = e.CompanyId,
        Username = e.CompanyId,
        CategoryName = e.Category.Name,
        FirstName = e.FirstName,
        MiddleName = e.MiddleName,
        LastName = e.LastName,
        MobileNumber = e.MobileNumber,
        Age = e.Age,
        Sex = e.Sex,
        Bday = e.Bday,
        Nationality = e.Nationality,
        Department = e.Department,
        OfficePosition = e.OfficePosition,
        PersonalEmail = e.PersonalEmail,
        CompanyEmail = e.CompanyEmail,
        StartDate = e.StartDate,
        Status = e.Status,
        CreatedAt = e.CreatedAt
    };
}