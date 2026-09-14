using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using STLAF.Api.Common;
using STLAF.Api.Common.Entities;
using STLAF.Api.Data;
using STLAF.Api.Departments.IT.DTOs;
using STLAF.Api.Departments.IT.Services;

namespace STLAF.Api.Departments.IT.Controllers;

public class SetInternModulesDto
{
    public List<string> Modules { get; set; } = new();
}

[ApiController]
[Route("api/it/interns")]
[Authorize(Policy = "intern-accounts")]
public class InternAccountsController : ControllerBase
{
    private const string InternCategoryName = "Intern";

    private readonly IInternAccountService _internAccountService;
    private readonly AppDbContext _db;

    public InternAccountsController(IInternAccountService internAccountService, AppDbContext db)
    {
        _internAccountService = internAccountService;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetInterns()
    {
        var interns = await _internAccountService.GetInternsAsync();
        return Ok(interns);
    }

    [HttpPost]
    public async Task<IActionResult> CreateIntern(CreateInternAccountDto dto)
    {
        try
        {
            var result = await _internAccountService.CreateInternAsync(dto);
            return CreatedAtAction(nameof(GetInterns), result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIntern(Guid id, UpdateInternAccountDto dto)
    {
        try
        {
            var result = await _internAccountService.UpdateInternAsync(id, dto);
            if (result is null) return NotFound();
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/modules")]
    public async Task<IActionResult> GetInternModules(Guid id)
    {
        var officePosition = await FindInternOfficePositionAsync(id);
        if (officePosition is null) return NotFound();

        var modules = await _db.ModuleAccessPositions
            .Where(m => m.OfficePosition == officePosition)
            .Select(m => m.Module)
            .ToListAsync();
        return Ok(modules);
    }

    [HttpPut("{id}/modules")]
    public async Task<IActionResult> SetInternModules(Guid id, SetInternModulesDto dto)
    {
        var officePosition = await FindInternOfficePositionAsync(id);
        if (officePosition is null) return NotFound();

        var invalid = dto.Modules.Where(m => !ModuleCatalog.IsValid(m)).ToList();
        if (invalid.Count > 0)
        {
            return BadRequest(new { message = $"Unknown module(s): {string.Join(", ", invalid)}" });
        }

        var existing = await _db.ModuleAccessPositions
            .Where(m => m.OfficePosition == officePosition)
            .ToListAsync();

        var toRemove = existing.Where(m => !dto.Modules.Contains(m.Module));
        var toAdd = dto.Modules
            .Where(key => !existing.Any(m => m.Module == key))
            .Select(key => new ModuleAccessPosition { Module = key, OfficePosition = officePosition });

        _db.ModuleAccessPositions.RemoveRange(toRemove);
        _db.ModuleAccessPositions.AddRange(toAdd);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private async Task<string?> FindInternOfficePositionAsync(Guid id)
    {
        return await _db.Employees
            .Where(e => e.Id == id && e.Category.Name == InternCategoryName)
            .Select(e => e.OfficePosition)
            .FirstOrDefaultAsync();
    }
}
