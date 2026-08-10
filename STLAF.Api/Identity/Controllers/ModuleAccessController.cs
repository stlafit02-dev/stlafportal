using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using STLAF.Api.Data;

namespace STLAF.Api.Common.Controllers;

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
}