using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.ClientPortal.Entities;
using STLAF.Api.Data;

namespace STLAF.Api.ClientPortal.Services;

public class SubmissionService : ISubmissionService
{
    private readonly AppDbContext _db;
    private readonly IServiceScopeFactory _scopeFactory;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public SubmissionService(AppDbContext db, IServiceScopeFactory scopeFactory)
    {
        _db = db;
        _scopeFactory = scopeFactory;
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
            dto.Responses.TryGetValue(field.Key, out var value);
            if (!HasMeaningfulValue(value))
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

        RunGenerationInBackground(submission.Id);

        return new SubmissionOutcome { Result = Map(submission) };
    }

    // Rendering a docx template (LibreOffice conversion) can take a while, so it must not
    // block the request — the client gets the submission back immediately (status
    // "submitted"), shows its own instant draft, and polls GetByIdAsync/the documents
    // endpoint for the real PDF. Runs in its own DI scope since the request's scope (and
    // its AppDbContext) is disposed as soon as this method returns.
    private void RunGenerationInBackground(Guid submissionId)
    {
        _ = Task.Run(async () =>
        {
            using var scope = _scopeFactory.CreateScope();
            var generation = scope.ServiceProvider.GetRequiredService<IDocumentGenerationService>();
            await generation.GenerateAsync(submissionId);
        });
    }

    // A "list" field's answer is a JSON string array, not a scalar — an empty array or one
    // containing only blank strings must count as missing, same as an empty text field.
    private static bool HasMeaningfulValue(object? value)
    {
        if (value is null) return false;
        if (value is string s) return !string.IsNullOrWhiteSpace(s);
        if (value is JsonElement { ValueKind: JsonValueKind.Array } array)
        {
            return array.EnumerateArray().Any(e => e.ValueKind != JsonValueKind.String || !string.IsNullOrWhiteSpace(e.GetString()));
        }
        return true;
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

        RunGenerationInBackground(submissionId);
        return true;
    }

    public async Task<SubmissionDto?> GetByIdAsync(Guid clientId, Guid id)
    {
        var submission = await _db.ClientPortalSubmissions
            .FirstOrDefaultAsync(s => s.Id == id && s.ClientAccountId == clientId);
        return submission is null ? null : Map(submission);
    }
}
