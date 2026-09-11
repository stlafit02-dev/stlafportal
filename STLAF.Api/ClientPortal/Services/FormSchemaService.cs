using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.ClientPortal.Entities;
using STLAF.Api.Data;

namespace STLAF.Api.ClientPortal.Services;

public class FormSchemaService : IFormSchemaService
{
    private readonly AppDbContext _db;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public FormSchemaService(AppDbContext db)
    {
        _db = db;
    }

    private static FormSchemaDto Map(FormSchema schema) => new()
    {
        Id = schema.Id,
        ServiceId = schema.DocumentTemplate.ServiceId,
        Version = schema.Version,
        Fields = JsonSerializer.Deserialize<List<FieldDefinitionDto>>(schema.FieldsJson, JsonOptions) ?? new()
    };

    public async Task<FormSchemaDto?> GetLatestAsync(Guid serviceId)
    {
        var schema = await _db.ClientPortalFormSchemas
            .Include(f => f.DocumentTemplate)
            .Where(f => f.DocumentTemplate.ServiceId == serviceId)
            .OrderByDescending(f => f.Version)
            .FirstOrDefaultAsync();

        return schema is null ? null : Map(schema);
    }
}
