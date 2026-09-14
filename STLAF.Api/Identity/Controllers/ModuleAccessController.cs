using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using STLAF.Api.Common;
using STLAF.Api.Common.Entities;
using STLAF.Api.Data;

namespace STLAF.Api.Common.Controllers;

public class SetPositionModulesDto
{
    public List<string> Modules { get; set; } = new();
}

[ApiController]
[Route("api/module-access")]
[Authorize]
public class ModuleAccessController : ControllerBase
{
    private readonly AppDbContext _db;

    public ModuleAccessController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var rows = await _db.ModuleAccessPositions
            .Select(m => new { module = m.Module, officePosition = m.OfficePosition })
            .ToListAsync();
        return Ok(rows);
    }

    [HttpGet("catalog")]
    public IActionResult GetCatalog()
    {
        return Ok(ModuleCatalog.Modules.Select(m => new { key = m.Key, label = m.Label }));
    }

    [HttpPut("positions/{officePosition}")]
    public async Task<IActionResult> SetPositionModules(string officePosition, SetPositionModulesDto dto)
    {
        var role = User.FindFirst("role")?.Value;
        if (role != "SuperAdmin" && role != "DeptAdmin")
        {
            return Forbid();
        }

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
}