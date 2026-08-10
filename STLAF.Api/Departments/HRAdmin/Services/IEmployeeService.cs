using STLAF.Api.Departments.HRAdmin.DTOs;

namespace STLAF.Api.Departments.HRAdmin.Services;

public interface IEmployeeService
{
    Task<List<EmployeeCategoryDto>> GetCategoriesAsync();
    Task<EmployeeCategoryDto> CreateCategoryAsync(CreateEmployeeCategoryDto dto);

    Task<List<EmployeeDto>> GetEmployeesAsync();
    Task<string?> GetCompanyEmailForUserAsync(Guid userId);
    Task<CreateEmployeeResultDto> CreateEmployeeAsync(CreateEmployeeDto dto, string requestedByName, string requestedByEmail);
    Task<EmployeeDto?> UpdateEmployeeAsync(Guid id, UpdateEmployeeDto dto);
    Task<bool> DeleteEmployeeAsync(Guid id);
}