using System.Text;
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
            if (blurredKeys.Contains(key) && !isPremium) return string.Empty;
            return responses.TryGetValue(key, out var value) && value is not null ? value.ToString() ?? string.Empty : string.Empty;
        });

        var runs = paragraph.Elements<Run>().ToList();
        if (runs.Count == 0) return;

        var firstRun = runs[0];
        var keptText = firstRun.Elements<Text>().FirstOrDefault();
        if (keptText is null)
        {
            keptText = new Text();
            firstRun.AppendChild(keptText);
        }
        keptText.Text = replaced;
        keptText.Space = DocumentFormat.OpenXml.SpaceProcessingModeValues.Preserve;

        foreach (var extraText in firstRun.Elements<Text>().Skip(1).ToList()) extraText.Remove();
        foreach (var tab in firstRun.Elements<TabChar>().ToList()) tab.Remove();
        foreach (var br in firstRun.Elements<Break>().ToList()) br.Remove();

        for (var i = 1; i < runs.Count; i++) runs[i].Remove();
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
