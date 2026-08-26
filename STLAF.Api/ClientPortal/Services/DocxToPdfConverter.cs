using System.Diagnostics;

namespace STLAF.Api.ClientPortal.Services;

// Shells out to LibreOffice headless (installed in the API's Docker runtime image) since
// there is no pure-.NET library that renders a .docx to PDF with correct layout/fonts.
public static class DocxToPdfConverter
{
    private static readonly TimeSpan ConversionTimeout = TimeSpan.FromSeconds(45);

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
        var workDir = Path.Combine(Path.GetTempPath(), $"docx-convert-{Guid.NewGuid():N}");
        Directory.CreateDirectory(workDir);
        var docxPath = Path.Combine(workDir, "template.docx");
        var pdfPath = Path.Combine(workDir, "template.pdf");

        try
        {
            await File.WriteAllBytesAsync(docxPath, docxBytes);

            var sofficePath = ResolveSofficeExecutable();
            using var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = sofficePath,
                    ArgumentList = { "--headless", "--norestore", "--convert-to", "pdf", "--outdir", workDir, docxPath },
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
