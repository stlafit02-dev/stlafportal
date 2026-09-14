using Microsoft.AspNetCore.Authorization;

namespace STLAF.Api.ClientPortal.Policies;

public class ClientAccountRequirement : IAuthorizationRequirement
{
}

public class ClientAccountAuthorizationHandler : AuthorizationHandler<ClientAccountRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ClientAccountRequirement requirement)
    {
        var accountType = context.User.FindFirst("accountType")?.Value;
        if (accountType == "Client")
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
