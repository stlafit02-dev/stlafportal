using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.Departments.HRAdmin.DTOs;
using STLAF.Api.Departments.HRAdmin.Services;

namespace STLAF.Api.Departments.HRAdmin.Controllers;

[ApiController]
[Route("api/overtime")]
[Authorize]
public class OvertimeController : ControllerBase
{
    private readonly IOvertimeService _service;

    public OvertimeController(IOvertimeService service)
    {
        _service = service;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")!.Value);

    [HttpGet("my-requests")]
    public async Task<IActionResult> GetMyRequests() => Ok(await _service.GetMyRequestsAsync(CurrentUserId));

    [HttpPost("requests")]
    public async Task<IActionResult> CreateRequest(CreateOvertimeRequestDto dto) => Ok(await _service.CreateRequestAsync(CurrentUserId, dto));

    [HttpGet("am-i-dept-approver")]
    public async Task<IActionResult> AmIDeptApprover() => Ok(new { isApprover = await _service.IsDeptApproverAsync(CurrentUserId) });

    [HttpGet("pending-dept-approvals")]
    public async Task<IActionResult> GetPendingDeptApprovals() => Ok(await _service.GetPendingDeptApprovalsAsync(CurrentUserId));

    [HttpPost("requests/{id}/decide-dept")]
    public async Task<IActionResult> DecideDept(Guid id, DecideOvertimeDto dto)
    {
        var result = await _service.DecideDeptAsync(CurrentUserId, id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet("am-i-partner")]
    public async Task<IActionResult> AmIPartner() => Ok(new { isPartner = await _service.IsPartnerAsync(CurrentUserId) });

    [HttpGet("pending-partner-approvals")]
    public async Task<IActionResult> GetPendingPartnerApprovals() => Ok(await _service.GetPendingPartnerApprovalsAsync(CurrentUserId));

    [HttpPost("requests/{id}/decide-partner")]
    public async Task<IActionResult> DecidePartner(Guid id, DecideOvertimeDto dto)
    {
        var result = await _service.DecidePartnerAsync(CurrentUserId, id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet("partners")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> GetPartners() => Ok(await _service.GetPartnersAsync());

    [HttpPost("partners")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> SetPartner(SetOvertimePartnerDto dto) => Ok(await _service.SetPartnerAsync(dto));
}