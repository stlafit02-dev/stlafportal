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

// Merges a submission's responses into its service's document template and stores the
// result in Backblaze B2. Two template kinds are supported, picked by the stored file's
// extension: a real fillable PDF form (AcroForm field names matched against response
// keys), or a Word .docx with {{field_key}} text placeholders (filled via OpenXML, then
// rendered to PDF through LibreOffice headless). Free-plan documents leave fields flagged
// "blur on free" genuinely blank (the value is never written in) plus a watermark; the
// plan check reads the submission's own client's subscription row, never a value the
// caller supplies.
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
            var template = await _db.ClientPortalDocumentTemplates
                .Where(t => t.ServiceId == submission.ServiceId)
                .OrderByDescending(t => t.CreatedAt)
                .FirstOrDefaultAsync();

            if (template is null)
            {
                throw new InvalidOperationException("No document template configured for this service.");
            }

            var subscription = await _db.ClientPortalSubscriptions
                .FirstOrDefaultAsync(sub => sub.ClientAccountId == submission.ClientAccountId);
            var isPremium = subscription is { Plan: "premium", Status: "active" };

            using var templateStream = await _fileStorage.DownloadFileAsync(template.TemplateFileKey)
                ?? throw new InvalidOperationException("Could not download the document template.");

            var fieldConfig = JsonSerializer.Deserialize<List<TemplateFieldConfigDto>>(template.FieldConfigJson, JsonOptions) ?? new();
            var responses = JsonSerializer.Deserialize<Dictionary<string, object?>>(submission.ResponsesJson, JsonOptions) ?? new();
            var blurredKeys = fieldConfig.Where(f => f.BlurOnFree).Select(f => f.FieldKey).ToHashSet();

            var isDocx = template.TemplateFileKey.EndsWith(".docx", StringComparison.OrdinalIgnoreCase);
            using var outputStream = isDocx
                ? await RenderFromDocxAsync(templateStream, responses, blurredKeys, isPremium)
                : RenderFromPdf(templateStream, responses, blurredKeys, isPremium);

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

    private static MemoryStream RenderFromPdf(
        Stream templateStream,
        Dictionary<string, object?> responses,
        HashSet<string> blurredKeys,
        bool isPremium)
    {
        var document = PdfReader.Open(templateStream, PdfDocumentOpenMode.Modify);

        if (document.AcroForm is not null)
        {
            for (var i = 0; i < document.AcroForm.Fields.Elements.Count; i++)
            {
                if (document.AcroForm.Fields[i] is not PdfTextField textField) continue;
                var key = textField.Name;
                if (string.IsNullOrEmpty(key)) continue;

                // Real redaction: for a free-plan client, the value is never written into
                // the field at all — leaving it blank, not just visually covered.
                if (blurredKeys.Contains(key) && !isPremium) continue;

                if (responses.TryGetValue(key, out var value) && value is not null)
                {
                    textField.Value = new PdfString(value.ToString() ?? string.Empty);
                }
            }

            // Tells PDF viewers to regenerate each field's on-page appearance from its
            // Value rather than trusting a (nonexistent) cached appearance stream.
            document.AcroForm.Elements.SetBoolean("/NeedAppearances", true);
        }

        ApplyFreePlanWatermark(document, isPremium);
        return SaveToStream(document);
    }

    private static async Task<MemoryStream> RenderFromDocxAsync(
        Stream templateStream,
        Dictionary<string, object?> responses,
        HashSet<string> blurredKeys,
        bool isPremium)
    {
        using var filledDocx = DocxTemplateProcessor.Fill(templateStream, responses, blurredKeys, isPremium);
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
