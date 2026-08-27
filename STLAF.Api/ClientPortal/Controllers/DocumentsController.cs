using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.ClientPortal.Services;

namespace STLAF.Api.ClientPortal.Controllers;

[ApiController]
[Route("api/client-portal/documents")]
[Authorize(Policy = "ClientAccount")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentsService _service;

    public DocumentsController(IDocumentsService service)
    {
        _service = service;
    }

    private Guid CurrentClientId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")!.Value);

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine() => Ok(await _service.GetMineAsync(CurrentClientId));

    [HttpGet("by-submission/{submissionId}")]
    public async Task<IActionResult> GetForSubmission(Guid submissionId)
    {
        var document = await _service.GetForSubmissionAsync(CurrentClientId, submissionId);
        if (document is null) return NotFound();
        return Ok(document);
    }
}
