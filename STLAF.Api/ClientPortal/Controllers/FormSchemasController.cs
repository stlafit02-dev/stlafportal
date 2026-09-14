using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    [HttpGet("{serviceId}/latest")]
    [Authorize]
    public async Task<IActionResult> GetLatest(Guid serviceId)
    {
        var schema = await _service.GetLatestAsync(serviceId);
        if (schema is null) return NotFound();
        return Ok(schema);
    }
}
