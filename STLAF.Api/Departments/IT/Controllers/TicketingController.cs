using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using STLAF.Api.Departments.IT.DTOs;
using STLAF.Api.Departments.IT.Services;
using System.Security.Claims;

namespace STLAF.Api.Departments.IT.Controllers;

[ApiController]
[Route("api/it/tickets")]
public class TicketingController : ControllerBase
{
    private readonly ITicketingService _service;

    public TicketingController(ITicketingService service)
    {
        _service = service;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")!.Value);

    // Public — anyone in the firm can submit a ticket without logging in
    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("public-submission")]
    public async Task<IActionResult> Create(CreateTicketDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetQueue), result);
    }

    // Public — live queue of non-closed tickets
    [HttpGet("queue")]
    [AllowAnonymous]
    public async Task<IActionResult> GetQueue()
    {
        var tickets = await _service.GetOpenQueueAsync();
        return Ok(tickets);
    }

    // Public — status counts for the summary cards
    [HttpGet("summary")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _service.GetSummaryAsync();
        return Ok(summary);
    }

    // IT-only — full ticket list including closed
    [HttpGet]
    [Authorize(Policy = "it-ticketing")]
    public async Task<IActionResult> GetAll()
    {
        var tickets = await _service.GetAllAsync();
        return Ok(tickets);
    }

    // IT-only — list of IT staff for the assignee dropdown
    [HttpGet("staff")]
    [Authorize(Policy = "it-ticketing")]
    public async Task<IActionResult> GetStaff()
    {
        var staff = await _service.GetItStaffAsync();
        return Ok(staff);
    }

    // IT-only — change status
    [HttpPatch("{id}/status")]
    [Authorize(Policy = "it-ticketing")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateTicketStatusDto dto)
    {
        var result = await _service.UpdateStatusAsync(id, dto.Status);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPatch("{id}/remarks")]
    [Authorize(Policy = "it-ticketing")]
    public async Task<IActionResult> AddRemark(Guid id, AddTicketRemarkDto dto)
    {
        var result = await _service.AddRemarkAsync(id, dto.Remarks);
        if (result is null) return NotFound();
        return Ok(result);
    }

    // IT-only — assign/reassign
    [HttpPatch("{id}/assign")]
    [Authorize(Policy = "it-ticketing")]
    public async Task<IActionResult> Assign(Guid id, AssignTicketDto dto)
    {
        var result = await _service.AssignAsync(id, dto.AssignedToId);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "it-ticketing")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    // ---------- Portal (employee self-service) ----------

    [HttpGet("my-profile")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile()
    {
        var profile = await _service.GetMyProfileAsync(CurrentUserId);
        if (profile is null) return NotFound();
        return Ok(profile);
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyTickets() => Ok(await _service.GetMyTicketsAsync(CurrentUserId));

    [HttpPost("my")]
    [Authorize]
    public async Task<IActionResult> CreateMyTicket(CreatePortalTicketDto dto) => Ok(await _service.CreateFromPortalAsync(CurrentUserId, dto));
}