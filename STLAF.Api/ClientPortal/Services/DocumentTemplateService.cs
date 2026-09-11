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

    private static DocumentTemplateDto Map(DocumentTemplate template, FormSchema formSchema) => new()
    {
        Id = template.Id,
        ServiceId = template.ServiceId,
        TemplateFileKey = template.TemplateFileKey,
        FieldConfig = JsonSerializer.Deserialize<List<TemplateFieldConfigDto>>(template.FieldConfigJson, JsonOptions) ?? new(),
        CreatedAt = template.CreatedAt,
        FormSchemaVersion = formSchema.Version,
        Fields = JsonSerializer.Deserialize<List<FieldDefinitionDto>>(formSchema.FieldsJson, JsonOptions) ?? new()
    };

    public async Task<DocumentTemplateDto?> GetByServiceAsync(Guid serviceId)
    {
        var template = await _db.ClientPortalDocumentTemplates
            .Where(t => t.ServiceId == serviceId)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync();
        if (template is null) return null;

        var formSchema = await _db.ClientPortalFormSchemas
            .FirstOrDefaultAsync(f => f.DocumentTemplateId == template.Id);
        if (formSchema is null) return null;

        return Map(template, formSchema);
    }

    public async Task<DocumentTemplateDto> UploadAsync(
        Guid serviceId,
        Stream fileStream,
        string fileName,
        string contentType,
        List<TemplateFieldConfigDto> fieldConfig,
        List<FieldDefinitionDto> fields)
    {
        var uploadResult = await _fileStorage.UploadFileAsync(fileStream, fileName, contentType, TemplateFolder)
            ?? throw new InvalidOperationException("Could not upload the template file to storage.");

        var currentMaxVersion = await _db.ClientPortalFormSchemas
            .Where(f => f.DocumentTemplate.ServiceId == serviceId)
            .Select(f => (int?)f.Version)
            .MaxAsync() ?? 0;

        var template = new DocumentTemplate
        {
            ServiceId = serviceId,
            TemplateFileKey = uploadResult.objectKey,
            FieldConfigJson = JsonSerializer.Serialize(fieldConfig, JsonOptions)
        };
        _db.ClientPortalDocumentTemplates.Add(template);

        var formSchema = new FormSchema
        {
            DocumentTemplate = template,
            Version = currentMaxVersion + 1,
            FieldsJson = JsonSerializer.Serialize(fields, JsonOptions)
        };
        _db.ClientPortalFormSchemas.Add(formSchema);

        await _db.SaveChangesAsync();

        return Map(template, formSchema);
    }
}
