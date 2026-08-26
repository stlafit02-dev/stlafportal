using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.ClientPortal.Services;

namespace STLAF.Api.ClientPortal.Controllers;

[ApiController]
[Route("api/client-portal/services")]
public class ServicesController : ControllerBase
{
    private readonly IServiceCatalogService _service;

    public ServicesController(IServiceCatalogService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Policy = "ClientAccount")]
    public async Task<IActionResult> GetActive() => Ok(await _service.GetActiveAsync());

    [HttpGet("admin")]
    [Authorize(Policy = "client-portal-admin")]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("admin/{id}")]
    [Authorize(Policy = "client-portal-admin")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost("admin")]
    [Authorize(Policy = "client-portal-admin")]
    public async Task<IActionResult> Create(SaveServiceDto dto) => Ok(await _service.SaveAsync(null, dto));

    [HttpPut("admin/{id}")]
    [Authorize(Policy = "client-portal-admin")]
    public async Task<IActionResult> Update(Guid id, SaveServiceDto dto) => Ok(await _service.SaveAsync(id, dto));
}
