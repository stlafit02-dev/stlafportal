using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.ClientPortal.Services;

namespace STLAF.Api.ClientPortal.Controllers;

[ApiController]
[Route("api/client-portal/submissions")]
[Authorize(Policy = "ClientAccount")]
public class SubmissionsController : ControllerBase
{
    private readonly ISubmissionService _service;

    public SubmissionsController(ISubmissionService service)
    {
        _service = service;
    }

    private Guid CurrentClientId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")!.Value);

    [HttpPost]
    public async Task<IActionResult> Create(CreateSubmissionDto dto)
    {
        var outcome = await _service.CreateAsync(CurrentClientId, dto);
        if (outcome.Result is null) return BadRequest(new { message = outcome.ErrorMessage });
        return Ok(outcome.Result);
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine() => Ok(await _service.GetMineAsync(CurrentClientId));

    [HttpPost("{id}/retry")]
    public async Task<IActionResult> Retry(Guid id)
    {
        var succeeded = await _service.RetryGenerationAsync(CurrentClientId, id);
        if (!succeeded) return NotFound();
        return Ok();
    }
}
