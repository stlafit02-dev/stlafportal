using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;
using PdfSharpCore.Pdf.AcroForms;
using PdfSharpCore.Pdf.IO;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.ClientPortal.Entities;
using STLAF.Api.Common.Services;
using STLAF.Api.Data;

namespace STLAF.Api.ClientPortal.Services;

public class DocumentGenerationService : IDocumentGenerationService
{
    private readonly AppDbContext _db;
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<DocumentGenerationService> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private const string DocumentFolder = "client-portal-documents";

    public DocumentGenerationService(AppDbContext db, IFileStorageService fileStorage, ILogger<DocumentGenerationService> logger)
    {
        _db = db;
        _fileStorage = fileStorage;
        _logger = logger;
    }

    public async Task GenerateAsync(Guid submissionId)
    {
        var submission = await _db.ClientPortalSubmissions.FirstOrDefaultAsync(s => s.Id == submissionId);
        if (submission is null) return;

        submission.Status = "processing";
        submission.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        try
        {
            var subscription = await _db.ClientPortalSubscriptions
                .FirstOrDefaultAsync(sub => sub.ClientAccountId == submission.ClientAccountId);
            var isPremium = subscription is { Plan: "premium", Status: "active" };
            var responses = JsonSerializer.Deserialize<Dictionary<string, object?>>(submission.ResponsesJson, JsonOptions) ?? new();

            using var outputStream = await RenderDocumentAsync(submission.ServiceId, responses, isPremium)
                ?? throw new InvalidOperationException("No document template configured for this service.");

            var uploadResult = await _fileStorage.UploadFileAsync(outputStream, $"{submissionId}.pdf", "application/pdf", DocumentFolder)
                ?? throw new InvalidOperationException("Could not store the generated document.");

            _db.ClientPortalGeneratedDocuments.Add(new GeneratedDocument
            {
                SubmissionId = submissionId,
                FileKey = uploadResult.objectKey
            });

            submission.Status = "completed";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Document generation failed for submission {SubmissionId}.", submissionId);
            submission.Status = "failed";
        }

        submission.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task<byte[]?> RenderPreviewAsync(Guid clientId, Guid serviceId, Dictionary<string, object?> responses)
    {
        var subscription = await _db.ClientPortalSubscriptions
            .FirstOrDefaultAsync(sub => sub.ClientAccountId == clientId);
        var isPremium = subscription is { Plan: "premium", Status: "active" };

        using var outputStream = await RenderDocumentAsync(serviceId, responses, isPremium);
        return outputStream?.ToArray();
    }

    private async Task<MemoryStream?> RenderDocumentAsync(Guid serviceId, Dictionary<string, object?> responses, bool isPremium)
    {
        var template = await _db.ClientPortalDocumentTemplates
            .Where(t => t.ServiceId == serviceId)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync();
        if (template is null) return null;

        using var templateStream = await _fileStorage.DownloadFileAsync(template.TemplateFileKey)
            ?? throw new InvalidOperationException("Could not download the document template.");

        var fieldConfig = JsonSerializer.Deserialize<List<TemplateFieldConfigDto>>(template.FieldConfigJson, JsonOptions) ?? new();
        var blurredKeys = fieldConfig.Where(f => f.BlurOnFree).Select(f => f.FieldKey).ToHashSet();

        var formSchema = await _db.ClientPortalFormSchemas
            .FirstOrDefaultAsync(f => f.DocumentTemplateId == template.Id);
        var fieldsByKey = (formSchema is null
                ? new List<FieldDefinitionDto>()
                : JsonSerializer.Deserialize<List<FieldDefinitionDto>>(formSchema.FieldsJson, JsonOptions) ?? new())
            .ToDictionary(f => f.Key);

        var isDocx = template.TemplateFileKey.EndsWith(".docx", StringComparison.OrdinalIgnoreCase);
        return isDocx
            ? await RenderFromDocxAsync(templateStream, responses, blurredKeys, isPremium, fieldsByKey)
            : RenderFromPdf(templateStream, responses, blurredKeys, isPremium, fieldsByKey);
    }

    private static MemoryStream RenderFromPdf(
        Stream templateStream,
        Dictionary<string, object?> responses,
        HashSet<string> blurredKeys,
        bool isPremium,
        Dictionary<string, FieldDefinitionDto> fieldsByKey)
    {
        var document = PdfReader.Open(templateStream, PdfDocumentOpenMode.Modify);

        if (document.AcroForm is not null)
        {
            for (var i = 0; i < document.AcroForm.Fields.Elements.Count; i++)
            {
                if (document.AcroForm.Fields[i] is not PdfTextField textField) continue;
                var key = textField.Name;
                if (string.IsNullOrEmpty(key)) continue;

                if (blurredKeys.Contains(key) && !isPremium) continue;

                if (responses.TryGetValue(key, out var value) && value is not null)
                {
                    var formatted = DocxTemplateProcessor.FormatValue(value, key, blurredKeys, isPremium, fieldsByKey);
                    textField.Value = new PdfString(formatted);
                    if (formatted.Contains('\n')) textField.MultiLine = true;
                }
            }

            document.AcroForm.Elements.SetBoolean("/NeedAppearances", true);
        }

        ApplyFreePlanWatermark(document, isPremium);
        return SaveToStream(document);
    }

    private static async Task<MemoryStream> RenderFromDocxAsync(
        Stream templateStream,
        Dictionary<string, object?> responses,
        HashSet<string> blurredKeys,
        bool isPremium,
        Dictionary<string, FieldDefinitionDto> fieldsByKey)
    {
        using var filledDocx = DocxTemplateProcessor.Fill(templateStream, responses, blurredKeys, isPremium, fieldsByKey);
        var pdfBytes = await DocxToPdfConverter.ConvertAsync(filledDocx.ToArray());

        using var pdfStream = new MemoryStream(pdfBytes);
        var document = PdfReader.Open(pdfStream, PdfDocumentOpenMode.Modify);

        ApplyFreePlanWatermark(document, isPremium);
        return SaveToStream(document);
    }

    private static void ApplyFreePlanWatermark(PdfDocument document, bool isPremium)
    {
        if (isPremium) return;

        var watermarkFont = new XFont("Helvetica", 42);
        var watermarkBrush = new XSolidBrush(XColor.FromArgb(60, 150, 150, 150));

        foreach (var page in document.Pages.Cast<PdfPage>())
        {
            using var gfx = XGraphics.FromPdfPage(page);
            var positions = new[]
            {
                (page.Width.Point * 0.2, page.Height.Point * 0.3),
                (page.Width.Point * 0.1, page.Height.Point * 0.6),
                (page.Width.Point * 0.3, page.Height.Point * 0.85)
            };

            foreach (var (x, y) in positions)
            {
                gfx.Save();
                gfx.TranslateTransform(x, y);
                gfx.RotateTransform(-30);
                gfx.DrawString("FREE PLAN — STLAF DRAFT", watermarkFont, watermarkBrush, new XPoint(0, 0));
                gfx.Restore();
            }
        }
    }

    private static MemoryStream SaveToStream(PdfDocument document)
    {
        var output = new MemoryStream();
        document.Save(output, closeStream: false);
        output.Position = 0;
        return output;
    }
}
