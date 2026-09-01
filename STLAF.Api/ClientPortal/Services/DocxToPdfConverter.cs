using System.Collections.Concurrent;
using System.Diagnostics;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace STLAF.Api.ClientPortal.Services;

// Shells out to LibreOffice headless (installed in the API's Docker runtime image) since
// there is no pure-.NET library that renders a .docx to PDF with correct layout/fonts.
//
// Two things were measured directly (concurrent conversions against a real LibreOffice
// install) before landing on this design:
//   1. Two+ processes pointed at the SAME user profile ("UserInstallation") at the same
//      time race on that profile's lock — one of them exits with a failure (not just a
//      slow hang) even when the profile is already warm. This gets more likely, not less,
//      as concurrency goes up.
//   2. A brand-new, never-used profile's first real conversion is ~4x slower (~18-20s vs
//      ~5s) than one reusing an already-used profile — so giving every single conversion
//      its own fresh profile (the obvious fix for #1) trades an occasional failure for a
//      permanent 4x slowdown.
// The fix is a small pool of persistent profiles: each conversion checks one out
// (guaranteeing no two conversions ever touch the same profile concurrently, fixing #1),
// and profiles are reused across calls and pre-warmed at startup (fixing #2).
public static class DocxToPdfConverter
{
    private static readonly TimeSpan ConversionTimeout = TimeSpan.FromSeconds(45);

    // Realistic concurrent docx submissions are expected to be low; this just needs to be
    // bigger than "one," so genuinely-simultaneous requests don't serialize on a single
    // profile, without warming (and holding open) more LibreOffice profiles than needed.
    private const int PoolSize = 3;
    private static readonly string PoolRoot = Path.Combine(Path.GetTempPath(), "stlaf-libreoffice-profiles");
    private static readonly SemaphoreSlim PoolSemaphore = new(PoolSize, PoolSize);
    private static readonly ConcurrentQueue<int> FreeSlots = new(Enumerable.Range(0, PoolSize));
    private static readonly Lazy<Task> Warmup = new(WarmAllSlotsAsync);

    // Call once at startup so the first real submission never pays a slot's one-time
    // warm-up cost. Safe to call more than once (or not at all — a slot warms itself on
    // first real use if nothing has called this yet).
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
                // Best effort — if warm-up fails, the first real conversion to land on
                // this slot just pays the cost (and, if LibreOffice is genuinely missing,
                // surfaces the same error it always would).
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

    // On Windows, Process.Start inherits the PATH captured when the dotnet process itself
    // was launched — editing PATH afterward and re-running `dotnet run` in the same
    // terminal/IDE session often doesn't pick it up. Checking the standard install
    // location directly sidesteps that entirely; PATH is only the fallback (which is what
    // the Docker runtime image relies on, since apt-get puts it there for every new
    // process with no stale-environment risk).
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
            // Semaphore accounting guarantees a slot is available; this would only happen
            // on a logic error above.
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
                try { process.Kill(entireProcessTree: true); } catch { /* best effort */ }
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
            try { Directory.Delete(workDir, recursive: true); } catch { /* best effort cleanup */ }
        }
    }
}
