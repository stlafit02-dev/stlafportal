using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using STLAF.Api.Data;
using STLAF.Api.Departments.HRAdmin.Entities;
using STLAF.Api.Departments.IT.DTOs;
using STLAF.Api.Departments.IT.Services;

namespace STLAF.Api.Departments.IT.Controllers;

[ApiController]
[Route("api/it/gmail")]
[Authorize(Policy = "IT")]
public class GmailManagementController : ControllerBase
{
    private readonly IGmailService _service;
    private readonly AppDbContext _db;

    public GmailManagementController(IGmailService service, AppDbContext db)
    {
        _service = service;
        _db = db;
    }

    [HttpGet("accounts")]
    public async Task<IActionResult> GetGwsAccounts()
    {
        var accounts = await _service.GetGwsAccountsAsync();
        return Ok(accounts);
    }

    [HttpPost("accounts")]
    public async Task<IActionResult> CreateGwsAccount(CreateGwsAccountDto dto)
    {
        var result = await _service.CreateGwsAccountAsync(dto);
        return CreatedAtAction(nameof(GetGwsAccounts), result);
    }

    [HttpPut("accounts/{id}")]
    public async Task<IActionResult> UpdateGwsAccount(Guid id, UpdateGwsAccountDto dto)
    {
        var result = await _service.UpdateGwsAccountAsync(id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet("emails")]
    public async Task<IActionResult> GetEmailAccounts()
    {
        var emails = await _service.GetEmailAccountsAsync();
        return Ok(emails);
    }

    [HttpPost("emails")]
    public async Task<IActionResult> CreateEmailAccount(CreateEmailAccountDto dto)
    {
        var updatedBy = User.FindFirst("name")?.Value ?? "Unknown";
        var result = await _service.CreateEmailAccountAsync(dto, updatedBy);
        return CreatedAtAction(nameof(GetEmailAccounts), result);
    }

    [HttpDelete("emails/{id}")]
    public async Task<IActionResult> DeleteEmailAccount(Guid id)
    {
        var updatedBy = User.FindFirst("name")?.Value ?? "Unknown";
        var deleted = await _service.DeleteEmailAccountAsync(id, updatedBy);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpPut("emails/{id}")]
    public async Task<IActionResult> UpdateEmailAccount(Guid id, UpdateEmailAccountDto dto)
    {
        var updatedBy = User.FindFirst("name")?.Value ?? "Unknown";
        var result = await _service.UpdateEmailAccountAsync(id, dto, updatedBy);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost("emails/{id}/recycle")]
    public async Task<IActionResult> RecycleEmailAccount(Guid id, RecycleEmailAccountDto dto)
    {
        var updatedBy = User.FindFirst("name")?.Value ?? "Unknown";
        var result = await _service.RecycleEmailAccountAsync(id, dto, updatedBy);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet("app-passwords")]
    public async Task<IActionResult> GetAppPasswords()
    {
        var passwords = await _service.GetAppPasswordsAsync();
        return Ok(passwords);
    }

    [HttpPost("app-passwords")]
    public async Task<IActionResult> CreateAppPassword(CreateAppPasswordDto dto)
    {
        var result = await _service.CreateAppPasswordAsync(dto);
        return CreatedAtAction(nameof(GetAppPasswords), result);
    }

    [HttpGet("registered-employees")]
    public async Task<IActionResult> GetRegisteredEmployees()
    {
        var employees = await _db.Employees
            .Where(e => e.Status == "Active")
            .OrderBy(e => e.FirstName)
            .Select(e => new RegisteredEmployeeOptionDto
            {
                Id = e.Id,
                FullName = e.FirstName + " " + e.LastName,
                CompanyId = e.CompanyId,
                Department = e.Department
            })
            .ToListAsync();

        return Ok(employees);
    }
}