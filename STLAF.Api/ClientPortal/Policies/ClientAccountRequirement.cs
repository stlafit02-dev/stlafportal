using Microsoft.AspNetCore.Authorization;

namespace STLAF.Api.ClientPortal.Policies;

// Marks an endpoint as callable only with a JWT issued to a ClientAccount
// (accountType=Client claim), never a staff token.
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
