using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace STLAF.Api.ClientPortal.Services;

// Word templates use plain {{field_key}} text placeholders instead of PDF AcroForm fields.
// Word frequently splits a single {{field_key}} across multiple <w:r> runs (autocorrect/spellcheck),
// so placeholders must be matched against each paragraph's concatenated text, not raw run text.
public static class DocxTemplateProcessor
{
    private static readonly Regex TokenPattern = new(@"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}", RegexOptions.Compiled);

    public static List<string> DetectFields(Stream docxStream)
    {
        using var document = WordprocessingDocument.Open(docxStream, false);
        var body = document.MainDocumentPart?.Document?.Body;
        if (body is null) return new();

        var keys = new List<string>();
        var seen = new HashSet<string>();
        foreach (var paragraph in body.Descendants<Paragraph>())
        {
            var text = GetParagraphText(paragraph);
            if (!text.Contains("{{")) continue;
            foreach (Match match in TokenPattern.Matches(text))
            {
                var key = match.Groups[1].Value;
                if (seen.Add(key)) keys.Add(key);
            }
        }
        return keys;
    }

    public static MemoryStream Fill(Stream docxStream, Dictionary<string, object?> responses, HashSet<string> blurredKeys, bool isPremium)
    {
        var output = new MemoryStream();
        docxStream.CopyTo(output);
        output.Position = 0;

        using (var document = WordprocessingDocument.Open(output, true))
        {
            var body = document.MainDocumentPart?.Document?.Body;
            if (body is not null)
            {
                foreach (var paragraph in body.Descendants<Paragraph>().ToList())
                {
                    FillParagraph(paragraph, responses, blurredKeys, isPremium);
                }
            }
        }

        output.Position = 0;
        return output;
    }

    private static void FillParagraph(Paragraph paragraph, Dictionary<string, object?> responses, HashSet<string> blurredKeys, bool isPremium)
    {
        var text = GetParagraphText(paragraph);
        if (!text.Contains("{{")) return;

        var replaced = TokenPattern.Replace(text, match =>
        {
            var key = match.Groups[1].Value;
            var value = responses.TryGetValue(key, out var v) ? v : null;
            return FormatValue(value, key, blurredKeys, isPremium);
        });

        var runs = paragraph.Elements<Run>().ToList();
        if (runs.Count == 0) return;

        var firstRun = runs[0];
        firstRun.RemoveAllChildren<Text>();
        firstRun.RemoveAllChildren<TabChar>();
        firstRun.RemoveAllChildren<Break>();

        // A "list" field's value renders as a numbered list, one item per line — Word only
        // shows a soft line break for an explicit <w:br/>, not an embedded "\n" character.
        var lines = replaced.Split('\n');
        for (var i = 0; i < lines.Length; i++)
        {
            if (i > 0) firstRun.AppendChild(new Break());
            firstRun.AppendChild(new Text(lines[i]) { Space = DocumentFormat.OpenXml.SpaceProcessingModeValues.Preserve });
        }

        for (var i = 1; i < runs.Count; i++) runs[i].Remove();
    }

    // A "list" field submits its answer as a JSON string array; every other field type
    // submits a scalar. Shared with the fillable-PDF path (DocumentGenerationService) so
    // both template kinds render a list the same way: a numbered "1. ...\n2. ..." block.
    internal static string FormatValue(object? value, string key, HashSet<string> blurredKeys, bool isPremium)
    {
        if (blurredKeys.Contains(key) && !isPremium) return string.Empty;
        if (value is null) return string.Empty;

        if (value is JsonElement { ValueKind: JsonValueKind.Array } arrayElement)
        {
            var items = arrayElement.EnumerateArray()
                .Select(e => e.ValueKind == JsonValueKind.String ? e.GetString() : e.ToString())
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .ToList();
            return string.Join("\n", items.Select((item, i) => $"{i + 1}. {item}"));
        }

        if (value is JsonElement { ValueKind: JsonValueKind.String } stringElement)
        {
            return stringElement.GetString() ?? string.Empty;
        }

        return value.ToString() ?? string.Empty;
    }

    private static string GetParagraphText(Paragraph paragraph)
    {
        var sb = new StringBuilder();
        foreach (var run in paragraph.Elements<Run>())
        {
            foreach (var child in run.ChildElements)
            {
                switch (child)
                {
                    case Text t: sb.Append(t.Text); break;
                    case TabChar: sb.Append('\t'); break;
                    case Break: sb.Append('\n'); break;
                }
            }
        }
        return sb.ToString();
    }
}
