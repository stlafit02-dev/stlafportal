using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.Common.DTOs;
using STLAF.Api.Common.Services;

namespace STLAF.Api.Common.Controllers;

[ApiController]
[Route("api/document-requests")]
[Authorize]
public class DocumentRequestsController : ControllerBase
{
    private readonly IDocumentRequestService _service;

    public DocumentRequestsController(IDocumentRequestService service)
    {
        _service = service;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")!.Value);

    [HttpGet("my-requests")]
    public async Task<IActionResult> GetMyRequests() => Ok(await _service.GetMyRequestsAsync(CurrentUserId));

    [HttpPost("requests")]
    [RequestSizeLimit(4_000_000)]
    public async Task<IActionResult> CreateRequest([FromForm] CreateDocumentRequestDto dto, IFormFile? file)
    {
        if (file is not null)
        {
            const long maxSizeBytes = 3_670_016;
            if (file.Length > maxSizeBytes)
                return BadRequest(new { message = "File is too large. Maximum size is 3.5 MB." });
        }

        try
        {
            using var stream = file?.OpenReadStream();
            var result = await _service.CreateRequestAsync(CurrentUserId, dto, stream, file?.FileName, file?.ContentType);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("requests/{id}")]
    [RequestSizeLimit(4_000_000)]
    public async Task<IActionResult> UpdateRequest(Guid id, [FromForm] UpdateDocumentRequestDto dto, IFormFile? file)
    {
        if (file is not null)
        {
            const long maxSizeBytes = 3_670_016;
            if (file.Length > maxSizeBytes)
                return BadRequest(new { message = "File is too large. Maximum size is 3.5 MB." });
        }

        try
        {
            using var stream = file?.OpenReadStream();
            var result = await _service.UpdateRequestAsync(CurrentUserId, id, dto, stream, file?.FileName, file?.ContentType);
            if (result is null) return NotFound();
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("requests/{id}/return")]
    public async Task<IActionResult> ReturnRequest(Guid id)
    {
        var result = await _service.ReturnRequestAsync(CurrentUserId, id);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("requests/{id}")]
    public async Task<IActionResult> DeleteRequest(Guid id)
    {
        var result = await _service.DeleteRequestAsync(CurrentUserId, id);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet("trash")]
    public async Task<IActionResult> GetTrash() => Ok(await _service.GetTrashAsync(CurrentUserId));

    [HttpPost("requests/{id}/restore")]
    public async Task<IActionResult> RestoreRequest(Guid id)
    {
        var result = await _service.RestoreRequestAsync(CurrentUserId, id);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("requests/{id}/permanent")]
    public async Task<IActionResult> HardDeleteRequest(Guid id)
    {
        var result = await _service.HardDeleteRequestAsync(CurrentUserId, id);
        if (!result) return NotFound();
        return NoContent();
    }


    [HttpGet("pending-ea")]
    [Authorize(Policy = "document-ea-review")]
    public async Task<IActionResult> GetPendingEa() => Ok(await _service.GetPendingEaAsync(CurrentUserId));

    [HttpPost("requests/{id}/decide-ea")]
    [Authorize(Policy = "document-ea-review")]
    public async Task<IActionResult> DecideEa(Guid id, DecideDocumentRequestDto dto)
    {
        var result = await _service.DecideEaAsync(CurrentUserId, id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet("returned-to-ea")]
    [Authorize(Policy = "document-ea-review")]
    public async Task<IActionResult> GetReturnedToEa() => Ok(await _service.GetReturnedToEaAsync(CurrentUserId));

    [HttpPost("requests/{id}/forward-rejection")]
    [Authorize(Policy = "document-ea-review")]
    public async Task<IActionResult> ForwardRejection(Guid id)
    {
        var result = await _service.ForwardRejectionAsync(CurrentUserId, id);
        if (result is null) return NotFound();
        return Ok(result);
    }


    [HttpGet("pending-partner")]
    [Authorize(Policy = "document-partner-review")]
    public async Task<IActionResult> GetPendingPartner() => Ok(await _service.GetPendingPartnerAsync(CurrentUserId));

    [HttpPost("requests/{id}/decide-partner")]
    [Authorize(Policy = "document-partner-review")]
    public async Task<IActionResult> DecidePartner(Guid id, DecideDocumentRequestDto dto)
    {
        var result = await _service.DecidePartnerAsync(CurrentUserId, id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }
    [HttpGet("partner-dashboard")]
    [Authorize(Policy = "document-partner-review")]
    public async Task<IActionResult> GetPartnerDashboard() => Ok(await _service.GetPartnerDashboardAsync());

    [HttpGet("partner-repository")]
    [Authorize(Policy = "document-partner-review")]
    public async Task<IActionResult> GetPartnerRepository([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null) =>
        Ok(await _service.GetPartnerRepositoryAsync(page, pageSize, search));

    [HttpDelete("requests/{id}/partner-archive")]
    [Authorize(Policy = "document-partner-review")]
    public async Task<IActionResult> ArchiveForPartner(Guid id)
    {
        var result = await _service.ArchiveForPartnerAsync(CurrentUserId, id);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet("partner-trash")]
    [Authorize(Policy = "document-partner-review")]
    public async Task<IActionResult> GetPartnerTrash() => Ok(await _service.GetPartnerTrashAsync(CurrentUserId));

    [HttpPost("requests/{id}/partner-restore")]
    [Authorize(Policy = "document-partner-review")]
    public async Task<IActionResult> RestoreForPartner(Guid id)
    {
        var result = await _service.RestoreForPartnerAsync(CurrentUserId, id);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("requests/{id}/partner-permanent")]
    [Authorize(Policy = "document-partner-review")]
    public async Task<IActionResult> HardDeleteForPartner(Guid id)
    {
        var result = await _service.HardDeleteForPartnerAsync(CurrentUserId, id);
        if (!result) return NotFound();
        return NoContent();
    }
}