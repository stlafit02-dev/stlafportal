using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.ClientPortal.Entities;
using STLAF.Api.Common.Services;
using STLAF.Api.Data;

namespace STLAF.Api.ClientPortal.Services;

public class DocumentTemplateService : IDocumentTemplateService
{
    private readonly AppDbContext _db;
    private readonly IFileStorageService _fileStorage;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private const string TemplateFolder = "client-portal-templates";

    public DocumentTemplateService(AppDbContext db, IFileStorageService fileStorage)
    {
        _db = db;
        _fileStorage = fileStorage;
    }

    private static DocumentTemplateDto Map(DocumentTemplate template) => new()
    {
        Id = template.Id,
        ServiceId = template.ServiceId,
        TemplateFileKey = template.TemplateFileKey,
        FieldConfig = JsonSerializer.Deserialize<List<TemplateFieldConfigDto>>(template.FieldConfigJson, JsonOptions) ?? new(),
        CreatedAt = template.CreatedAt
    };

    public async Task<DocumentTemplateDto?> GetByServiceAsync(Guid serviceId)
    {
        var template = await _db.ClientPortalDocumentTemplates
            .Where(t => t.ServiceId == serviceId)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync();

        return template is null ? null : Map(template);
    }

    public async Task<DocumentTemplateDto> UploadAsync(Guid serviceId, Stream fileStream, string fileName, string contentType, List<TemplateFieldConfigDto> fieldConfig)
    {
        var uploadResult = await _fileStorage.UploadFileAsync(fileStream, fileName, contentType, TemplateFolder)
            ?? throw new InvalidOperationException("Could not upload the template file to storage.");

        var template = new DocumentTemplate
        {
            ServiceId = serviceId,
            TemplateFileKey = uploadResult.objectKey,
            FieldConfigJson = JsonSerializer.Serialize(fieldConfig, JsonOptions)
        };

        _db.ClientPortalDocumentTemplates.Add(template);
        await _db.SaveChangesAsync();

        return Map(template);
    }
}
