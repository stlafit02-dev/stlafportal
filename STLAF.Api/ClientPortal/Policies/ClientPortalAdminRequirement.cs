using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using STLAF.Api.Data;

namespace STLAF.Api.ClientPortal.Policies;

// Staff-only: SuperAdmin/DeptAdmin always pass; everyone else needs a
// ClientPortalAdminGrant row for their own User.Id.
public class ClientPortalAdminRequirement : IAuthorizationRequirement
{
}

public static class ClientPortalAdminAccess
{
    public static async Task<bool> IsAllowedAsync(ClaimsPrincipal principal, AppDbContext db)
    {
        var role = principal.FindFirst("role")?.Value;
        if (role == "SuperAdmin" || role == "DeptAdmin")
        {
            return true;
        }

        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? principal.FindFirst("sub")?.Value;

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return false;
        }

        return await db.ClientPortalAdminGrants.AnyAsync(g => g.UserId == userId);
    }
}

public class ClientPortalAdminAuthorizationHandler : AuthorizationHandler<ClientPortalAdminRequirement>
{
    private readonly AppDbContext _db;

    public ClientPortalAdminAuthorizationHandler(AppDbContext db)
    {
        _db = db;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, ClientPortalAdminRequirement requirement)
    {
        if (await ClientPortalAdminAccess.IsAllowedAsync(context.User, _db))
        {
            context.Succeed(requirement);
        }
    }
}
