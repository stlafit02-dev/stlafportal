using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.ClientPortal.Policies;
using STLAF.Api.Data;

namespace STLAF.Api.ClientPortal.Controllers;

[ApiController]
[Route("api/client-portal-admin/access")]
public class ClientPortalAdminAccessController : ControllerBase
{
    private readonly AppDbContext _db;

    public ClientPortalAdminAccessController(AppDbContext db)
    {
        _db = db;
    }

    // Every logged-in employee calls this (from the sidebar nav builder) to decide
    // whether to show the admin module. Like IntakeFullAccessGrant, ClientPortalAdminGrant
    // rows are managed directly in the database, not through a CRUD API. Always 200 —
    // "not allowed" is a normal outcome for most callers, not an HTTP error.
    [HttpGet("mine")]
    [Authorize]
    public async Task<IActionResult> Mine()
    {
        var hasAccess = await ClientPortalAdminAccess.IsAllowedAsync(User, _db);
        return Ok(new { hasAccess });
    }
}
