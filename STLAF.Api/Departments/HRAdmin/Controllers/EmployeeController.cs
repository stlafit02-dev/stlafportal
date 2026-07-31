using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.Departments.HRAdmin.DTOs;
using STLAF.Api.Departments.HRAdmin.Services;

namespace STLAF.Api.Departments.HRAdmin.Controllers;

[ApiController]
[Route("api/hr")]
[Authorize(Policy = "HRAdmin")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _service;

    public EmployeesController(IEmployeeService service)
    {
        _service = service;
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _service.GetCategoriesAsync();
        return Ok(categories);
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory(CreateEmployeeCategoryDto dto)
    {
        var result = await _service.CreateCategoryAsync(dto);
        return CreatedAtAction(nameof(GetCategories), result);
    }

    [HttpGet("employees")]
    public async Task<IActionResult> GetEmployees()
    {
        var employees = await _service.GetEmployeesAsync();
        return Ok(employees);
    }

    [HttpPost("employees")]
    public async Task<IActionResult> CreateEmployee(CreateEmployeeDto dto)
    {
        if (dto.Bday.Date >= dto.StartDate.Date)
            return BadRequest(new { message = "Birthdate must be earlier than the start date." });

        var requestedByName = User.FindFirst("name")?.Value ?? "HR Admin";
        var requestedByEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "hr@stlaf.global";

        var result = await _service.CreateEmployeeAsync(dto, requestedByName, requestedByEmail);
        return CreatedAtAction(nameof(GetEmployees), result);
    }

    [HttpPut("employees/{id}")]
    public async Task<IActionResult> UpdateEmployee(Guid id, UpdateEmployeeDto dto)
    {
        if (dto.Bday.Date >= dto.StartDate.Date)
            return BadRequest(new { message = "Birthdate must be earlier than the start date." });

        var result = await _service.UpdateEmployeeAsync(id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("employees/{id}")]
    public async Task<IActionResult> DeleteEmployee(Guid id)
    {
        var deleted = await _service.DeleteEmployeeAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}