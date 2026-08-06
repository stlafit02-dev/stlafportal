using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.Departments.HRAdmin.DTOs;
using STLAF.Api.Departments.HRAdmin.Services;

namespace STLAF.Api.Departments.HRAdmin.Controllers;

[ApiController]
[Route("api/undertime")]
[Authorize]
public class UndertimeController : ControllerBase
{
    private readonly IUndertimeService _service;

    public UndertimeController(IUndertimeService service)
    {
        _service = service;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")!.Value);

    [HttpGet("my-requests")]
    public async Task<IActionResult> GetMyRequests() => Ok(await _service.GetMyRequestsAsync(CurrentUserId));

    [HttpPost("requests")]
    public async Task<IActionResult> CreateRequest(CreateUndertimeRequestDto dto) => Ok(await _service.CreateRequestAsync(CurrentUserId, dto));

    [HttpGet("am-i-approver")]
    public async Task<IActionResult> AmIApprover() => Ok(new { isApprover = await _service.IsApproverAsync(CurrentUserId) });

    [HttpGet("pending-approvals")]
    public async Task<IActionResult> GetPendingApprovals() => Ok(await _service.GetPendingApprovalsAsync(CurrentUserId));

    [HttpPost("requests/{id}/decide")]
    public async Task<IActionResult> Decide(Guid id, DecideUndertimeDto dto)
    {
        var result = await _service.DecideAsync(CurrentUserId, id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }
}