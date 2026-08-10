using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using STLAF.Api.Data;

namespace STLAF.Api.Identity.Policies;

public class ModuleAuthorizationHandler : AuthorizationHandler<ModuleRequirement>
{
    private readonly AppDbContext _db;

    public ModuleAuthorizationHandler(AppDbContext db)
    {
        _db = db;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, ModuleRequirement requirement)
    {
        var role = context.User.FindFirst("role")?.Value;

        if (role == "SuperAdmin" || role == "DeptAdmin")
        {
            context.Succeed(requirement);
            return;
        }

        var officePosition = context.User.FindFirst("officePosition")?.Value;
        if (string.IsNullOrWhiteSpace(officePosition))
        {
            return;
        }

        var isAllowed = await _db.ModuleAccessPositions
            .AnyAsync(m => m.Module == requirement.Module && m.OfficePosition == officePosition);

        if (isAllowed)
        {
            context.Succeed(requirement);
        }
    }
}