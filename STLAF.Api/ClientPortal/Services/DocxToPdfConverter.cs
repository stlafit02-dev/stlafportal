using System.Collections.Concurrent;
using System.Diagnostics;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace STLAF.Api.ClientPortal.Services;

public static class DocxToPdfConverter
{
    private static readonly TimeSpan ConversionTimeout = TimeSpan.FromSeconds(45);

    private const int PoolSize = 1;
    private static readonly string PoolRoot = Path.Combine(Path.GetTempPath(), "stlaf-libreoffice-profiles");
    private static readonly SemaphoreSlim PoolSemaphore = new(PoolSize, PoolSize);
    private static readonly ConcurrentQueue<int> FreeSlots = new(Enumerable.Range(0, PoolSize));
    private static readonly Lazy<Task> Warmup = new(WarmAllSlotsAsync);

    public static Task WarmupAsync() => Warmup.Value;

    private static string ProfileDirFor(int slot) => Path.Combine(PoolRoot, $"slot-{slot}");

    private static async Task WarmAllSlotsAsync()
    {
        var sampleDocx = BuildWarmupDocx();
        await Task.WhenAll(Enumerable.Range(0, PoolSize).Select(async slot =>
        {
            try
            {
                await RunConversionAsync(sampleDocx, ProfileDirFor(slot));
            }
            catch
            {
            }
        }));
    }

    private static byte[] BuildWarmupDocx()
    {
        using var stream = new MemoryStream();
        using (var doc = WordprocessingDocument.Create(stream, WordprocessingDocumentType.Document))
        {
            var mainPart = doc.AddMainDocumentPart();
            mainPart.Document = new Document(new Body(new Paragraph(new Run(new Text("warmup")))));
            mainPart.Document.Save();
        }
        return stream.ToArray();
    }

    private static string ResolveSofficeExecutable()
    {
        if (OperatingSystem.IsWindows())
        {
            var candidates = new[]
            {
                Environment.ExpandEnvironmentVariables(@"%ProgramFiles%\LibreOffice\program\soffice.exe"),
                Environment.ExpandEnvironmentVariables(@"%ProgramFiles(x86)%\LibreOffice\program\soffice.exe"),
                Environment.ExpandEnvironmentVariables(@"%LocalAppData%\Programs\LibreOffice\program\soffice.exe"),
            };
            var found = candidates.FirstOrDefault(File.Exists);
            if (found is not null) return found;
        }

        return "soffice";
    }

    public static async Task<byte[]> ConvertAsync(byte[] docxBytes)
    {
        await PoolSemaphore.WaitAsync();
        if (!FreeSlots.TryDequeue(out var slot))
        {
            throw new InvalidOperationException("No LibreOffice profile slot available despite the semaphore permitting one.");
        }

        try
        {
            return await RunConversionAsync(docxBytes, ProfileDirFor(slot));
        }
        finally
        {
            FreeSlots.Enqueue(slot);
            PoolSemaphore.Release();
        }
    }

    private static async Task<byte[]> RunConversionAsync(byte[] docxBytes, string profileDir)
    {
        var workDir = Path.Combine(Path.GetTempPath(), $"docx-convert-{Guid.NewGuid():N}");
        Directory.CreateDirectory(workDir);
        var docxPath = Path.Combine(workDir, "template.docx");
        var pdfPath = Path.Combine(workDir, "template.pdf");

        try
        {
            await File.WriteAllBytesAsync(docxPath, docxBytes);

            var sofficePath = ResolveSofficeExecutable();
            var profileUri = new Uri(profileDir).AbsoluteUri;
            using var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = sofficePath,
                    ArgumentList =
                    {
                        "--headless", "--norestore",
                        $"-env:UserInstallation={profileUri}",
                        "--convert-to", "pdf", "--outdir", workDir, docxPath,
                    },
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                }
            };

            try
            {
                process.Start();
            }
            catch (System.ComponentModel.Win32Exception ex)
            {
                throw new InvalidOperationException(
                    $"Could not start LibreOffice ('{sofficePath}') to convert the Word template to PDF. " +
                    "Make sure LibreOffice is installed and either at the standard install location or on PATH.", ex);
            }
            using var cts = new CancellationTokenSource(ConversionTimeout);
            try
            {
                await process.WaitForExitAsync(cts.Token);
            }
            catch (OperationCanceledException)
            {
                try { process.Kill(entireProcessTree: true); } catch {  }
                throw new InvalidOperationException("Converting the Word template to PDF timed out.");
            }

            if (process.ExitCode != 0 || !File.Exists(pdfPath))
            {
                var stderr = await process.StandardError.ReadToEndAsync();
                throw new InvalidOperationException($"Word-to-PDF conversion failed: {stderr}");
            }

            return await File.ReadAllBytesAsync(pdfPath);
        }
        finally
        {
            try { Directory.Delete(workDir, recursive: true); } catch {  }
        }
    }
}
