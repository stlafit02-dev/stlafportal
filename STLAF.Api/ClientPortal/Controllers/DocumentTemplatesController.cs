using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.ClientPortal.Services;

namespace STLAF.Api.ClientPortal.Controllers;

[ApiController]
[Route("api/client-portal/document-templates")]
[Authorize(Policy = "client-portal-admin")]
public class DocumentTemplatesController : ControllerBase
{
    private readonly IDocumentTemplateService _service;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public DocumentTemplatesController(IDocumentTemplateService service)
    {
        _service = service;
    }

    [HttpGet("{serviceId:guid}")]
    public async Task<IActionResult> GetByService(Guid serviceId)
    {
        var template = await _service.GetByServiceAsync(serviceId);
        if (template is null) return NotFound();
        return Ok(template);
    }

    private const string DocxContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    [HttpPost("{serviceId:guid}")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> Upload(Guid serviceId, IFormFile file, [FromForm] string fieldConfigJson)
    {
        var isPdf = file.ContentType == "application/pdf" || file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase);
        var isDocx = file.ContentType == DocxContentType || file.FileName.EndsWith(".docx", StringComparison.OrdinalIgnoreCase);

        if (file.Length == 0 || (!isPdf && !isDocx))
        {
            return BadRequest(new { message = "A PDF or Word (.docx) file is required." });
        }

        List<TemplateFieldConfigDto> fieldConfig;
        try
        {
            fieldConfig = JsonSerializer.Deserialize<List<TemplateFieldConfigDto>>(fieldConfigJson, JsonOptions) ?? new();
        }
        catch (JsonException)
        {
            return BadRequest(new { message = "Field config is not valid JSON." });
        }

        using var stream = file.OpenReadStream();
        var result = await _service.UploadAsync(serviceId, stream, file.FileName, isDocx ? DocxContentType : "application/pdf", fieldConfig);
        return Ok(result);
    }

    [HttpPost("detect-docx-fields")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public IActionResult DetectDocxFields(IFormFile file)
    {
        if (file.Length == 0)
        {
            return BadRequest(new { message = "A Word (.docx) file is required." });
        }

        try
        {
            using var stream = file.OpenReadStream();
            var fields = DocxTemplateProcessor.DetectFields(stream);
            return Ok(new { fields });
        }
        catch (Exception)
        {
            return BadRequest(new { message = "Could not read this Word document." });
        }
    }
}
