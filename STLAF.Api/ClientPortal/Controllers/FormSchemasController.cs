using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.ClientPortal.Services;

namespace STLAF.Api.ClientPortal.Controllers;

[ApiController]
[Route("api/client-portal/form-schemas")]
public class FormSchemasController : ControllerBase
{
    private readonly IFormSchemaService _service;

    public FormSchemasController(IFormSchemaService service)
    {
        _service = service;
    }

    // Any authenticated caller (client or staff admin) can read the current field
    // definitions — they aren't sensitive, and both the client form and the admin
    // editor need this.
    [HttpGet("{serviceId}/latest")]
    [Authorize]
    public async Task<IActionResult> GetLatest(Guid serviceId)
    {
        var schema = await _service.GetLatestAsync(serviceId);
        if (schema is null) return NotFound();
        return Ok(schema);
    }

    [HttpPost("{serviceId}")]
    [Authorize(Policy = "client-portal-admin")]
    public async Task<IActionResult> SaveNewVersion(Guid serviceId, SaveFormSchemaDto dto)
        => Ok(await _service.SaveNewVersionAsync(serviceId, dto));
}
