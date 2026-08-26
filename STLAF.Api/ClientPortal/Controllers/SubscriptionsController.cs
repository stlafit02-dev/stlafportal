using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.ClientPortal.Services;

namespace STLAF.Api.ClientPortal.Controllers;

[ApiController]
[Route("api/client-portal/subscriptions")]
[Authorize(Policy = "ClientAccount")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _service;

    public SubscriptionsController(ISubscriptionService service)
    {
        _service = service;
    }

    private Guid CurrentClientId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")!.Value);

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine() => Ok(await _service.GetMineAsync(CurrentClientId));
}
