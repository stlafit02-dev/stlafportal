using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.ClientPortal.Entities;
using STLAF.Api.Data;

namespace STLAF.Api.ClientPortal.Services;

public class SubmissionService : ISubmissionService
{
    private readonly AppDbContext _db;
    private readonly IDocumentGenerationService _documentGeneration;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public SubmissionService(AppDbContext db, IDocumentGenerationService documentGeneration)
    {
        _db = db;
        _documentGeneration = documentGeneration;
    }

    private static SubmissionDto Map(Submission submission) => new()
    {
        Id = submission.Id,
        ServiceId = submission.ServiceId,
        FormSchemaVersion = submission.FormSchemaVersion,
        Responses = JsonSerializer.Deserialize<Dictionary<string, object?>>(submission.ResponsesJson, JsonOptions) ?? new(),
        Status = submission.Status,
        CreatedAt = submission.CreatedAt
    };

    public async Task<SubmissionOutcome> CreateAsync(Guid clientId, CreateSubmissionDto dto)
    {
        var service = await _db.ClientPortalServices.FirstOrDefaultAsync(s => s.Id == dto.ServiceId && s.IsActive);
        if (service is null)
        {
            return new SubmissionOutcome { ErrorMessage = "This service is not available." };
        }

        var schema = await _db.ClientPortalFormSchemas
            .FirstOrDefaultAsync(f => f.ServiceId == dto.ServiceId && f.Version == dto.FormSchemaVersion);
        if (schema is null)
        {
            return new SubmissionOutcome { ErrorMessage = "This form is out of date. Please reload and try again." };
        }

        var fields = JsonSerializer.Deserialize<List<FieldDefinitionDto>>(schema.FieldsJson, JsonOptions) ?? new();
        foreach (var field in fields.Where(f => f.Required))
        {
            var hasValue = dto.Responses.TryGetValue(field.Key, out var value)
                && value is not null
                && !(value is string s && string.IsNullOrWhiteSpace(s));

            if (!hasValue)
            {
                return new SubmissionOutcome { ErrorMessage = $"{field.Label} is required." };
            }
        }

        var submission = new Submission
        {
            ClientAccountId = clientId,
            ServiceId = dto.ServiceId,
            FormSchemaVersion = dto.FormSchemaVersion,
            ResponsesJson = JsonSerializer.Serialize(dto.Responses, JsonOptions),
            Status = "submitted"
        };

        _db.ClientPortalSubmissions.Add(submission);
        await _db.SaveChangesAsync();

        try
        {
            await _documentGeneration.GenerateAsync(submission.Id);
        }
        catch
        {
            // Generation failure is surfaced via submission.Status; the client can retry.
        }

        await _db.Entry(submission).ReloadAsync();
        return new SubmissionOutcome { Result = Map(submission) };
    }

    public async Task<List<SubmissionDto>> GetMineAsync(Guid clientId)
    {
        var submissions = await _db.ClientPortalSubmissions
            .Where(s => s.ClientAccountId == clientId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return submissions.Select(Map).ToList();
    }

    public async Task<bool> RetryGenerationAsync(Guid clientId, Guid submissionId)
    {
        var owns = await _db.ClientPortalSubmissions.AnyAsync(s => s.Id == submissionId && s.ClientAccountId == clientId);
        if (!owns) return false;

        await _documentGeneration.GenerateAsync(submissionId);
        return true;
    }
}
