using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.Departments.IT.DTOs;
using STLAF.Api.Departments.IT.Services;

namespace STLAF.Api.Departments.IT.Controllers;

[ApiController]
[Route("api/it/assets")]
public class AssetManagementController : ControllerBase
{
    private readonly IAssetService _service;

    public AssetManagementController(IAssetService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Policy = "IT")]
    public async Task<IActionResult> GetAll()
    {
        var assets = await _service.GetAllAsync();
        return Ok(assets);
    }

    [HttpPost]
    [Authorize(Policy = "IT")]
    public async Task<IActionResult> Create(CreateAssetDto dto)
    {
        var createdByName = User.FindFirst("name")?.Value ?? "Unknown";
        var result = await _service.CreateAsync(dto, createdByName);
        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "IT")]
    public async Task<IActionResult> Update(Guid id, UpdateAssetDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }

    // Public — this is what the QR code links to, no login required
    [HttpGet("tag/{assetTag}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByTag(string assetTag)
    {
        var result = await _service.GetPublicByTagAsync(assetTag);
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
    [HttpGet("{assetId}/history")]
    [Authorize(Policy = "IT")]
    public async Task<IActionResult> GetHistory(Guid assetId)
    {
        var history = await _service.GetHistoryAsync(assetId);
        return Ok(history);
    }

    [HttpPost("history")]
    [Authorize(Policy = "IT")]
    public async Task<IActionResult> CreateHistory(CreateAssetHistoryDto dto)
    {
        var result = await _service.CreateHistoryAsync(dto);
        return CreatedAtAction(nameof(GetHistory), new { assetId = dto.AssetId }, result);
    }
}