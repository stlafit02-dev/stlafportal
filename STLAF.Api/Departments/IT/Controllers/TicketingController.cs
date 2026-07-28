using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.Departments.IT.DTOs;
using STLAF.Api.Departments.IT.Services;

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

    // Public — anyone in the firm can submit a ticket without logging in
    [HttpPost]
    [AllowAnonymous]
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
    [Authorize(Policy = "IT")]
    public async Task<IActionResult> GetAll()
    {
        var tickets = await _service.GetAllAsync();
        return Ok(tickets);
    }

    // IT-only — list of IT staff for the assignee dropdown
    [HttpGet("staff")]
    [Authorize(Policy = "IT")]
    public async Task<IActionResult> GetStaff()
    {
        var staff = await _service.GetItStaffAsync();
        return Ok(staff);
    }

    // IT-only — change status
    [HttpPatch("{id}/status")]
    [Authorize(Policy = "IT")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateTicketStatusDto dto)
    {
        var result = await _service.UpdateStatusAsync(id, dto.Status);
        if (result is null) return NotFound();
        return Ok(result);
    }

    // IT-only — assign/reassign
    [HttpPatch("{id}/assign")]
    [Authorize(Policy = "IT")]
    public async Task<IActionResult> Assign(Guid id, AssignTicketDto dto)
    {
        var result = await _service.AssignAsync(id, dto.AssignedToId);
        if (result is null) return NotFound();
        return Ok(result);
    }
    [HttpDelete("{id}")]
    [Authorize(Policy = "IT")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}