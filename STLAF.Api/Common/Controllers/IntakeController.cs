using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using STLAF.Api.Common.DTOs;
using STLAF.Api.Common.Services;

namespace STLAF.Api.Common.Controllers;

[ApiController]
[Route("api/intake")]
public class IntakeController : ControllerBase
{
    private readonly IIntakeFormService _service;
    private Guid CurrentUserId => Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")!.Value);
    public IntakeController(IIntakeFormService service)
    {
        _service = service;
    }

    [HttpGet("catalog")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCatalog() => Ok(await _service.GetCatalogAsync());

    [HttpGet("form-options")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFormOptions() => Ok(await _service.GetFormOptionsAsync());

    [HttpPost("submissions")]
    [AllowAnonymous]
    [RequestSizeLimit(6_000_000)]
    [EnableRateLimiting("public-submission")]
    public async Task<IActionResult> Submit([FromForm] CreateIntakeSubmissionDto dto, IFormFile? file)
    {
        if (file is not null && file.Length > 5_000_000)
            return BadRequest(new { message = "File is too large. Maximum size is 5 MB." });

        try
        {
            using var stream = file?.OpenReadStream();
            var result = await _service.SubmitAsync(dto, stream, file?.FileName, file?.ContentType);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpGet("my-submissions")]
    [Authorize]
    public async Task<IActionResult> GetMySubmissions() => Ok(await _service.GetMySubmissionsAsync(CurrentUserId));
    [HttpGet("am-i-point-person")]
    [Authorize]
    public async Task<IActionResult> AmIPointPerson() => Ok(await _service.IsPointPersonAsync(CurrentUserId));
}