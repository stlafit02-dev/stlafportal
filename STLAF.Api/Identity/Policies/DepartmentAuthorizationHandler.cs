using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using STLAF.Api.Data;

namespace STLAF.Api.Identity.Policies;

public class DepartmentRequirement : IAuthorizationRequirement
{
    public string Department { get; }
    public DepartmentRequirement(string department) => Department = department;
}

public class DepartmentAuthorizationHandler : AuthorizationHandler<DepartmentRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, DepartmentRequirement requirement)
    {
        var userDepartment = context.User.FindFirst("department")?.Value;
        var userRole = context.User.FindFirst("role")?.Value;

        if (userRole == "SuperAdmin" ||
            (userDepartment != null &&
             userDepartment.Equals(requirement.Department, StringComparison.OrdinalIgnoreCase)))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}