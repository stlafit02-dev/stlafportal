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

    [HttpGet("mine")]
    [Authorize]
    public async Task<IActionResult> Mine()
    {
        var hasAccess = await ClientPortalAdminAccess.IsAllowedAsync(User, _db);
        return Ok(new { hasAccess });
    }
}
