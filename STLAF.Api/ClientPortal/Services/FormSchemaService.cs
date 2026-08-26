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
        ServiceId = schema.ServiceId,
        Version = schema.Version,
        Fields = JsonSerializer.Deserialize<List<FieldDefinitionDto>>(schema.FieldsJson, JsonOptions) ?? new()
    };

    public async Task<FormSchemaDto?> GetLatestAsync(Guid serviceId)
    {
        var schema = await _db.ClientPortalFormSchemas
            .Where(f => f.ServiceId == serviceId)
            .OrderByDescending(f => f.Version)
            .FirstOrDefaultAsync();

        return schema is null ? null : Map(schema);
    }

    public async Task<FormSchemaDto> SaveNewVersionAsync(Guid serviceId, SaveFormSchemaDto dto)
    {
        var currentMax = await _db.ClientPortalFormSchemas
            .Where(f => f.ServiceId == serviceId)
            .Select(f => (int?)f.Version)
            .MaxAsync() ?? 0;

        var schema = new FormSchema
        {
            ServiceId = serviceId,
            Version = currentMax + 1,
            FieldsJson = JsonSerializer.Serialize(dto.Fields, JsonOptions)
        };

        _db.ClientPortalFormSchemas.Add(schema);
        await _db.SaveChangesAsync();

        return Map(schema);
    }
}
