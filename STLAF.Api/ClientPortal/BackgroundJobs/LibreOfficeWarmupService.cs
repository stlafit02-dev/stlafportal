using STLAF.Api.ClientPortal.Services;

namespace STLAF.Api.ClientPortal.BackgroundJobs;

// Pre-warms the LibreOffice document-conversion profile pool in the background at startup
// so the first real client-portal submission doesn't pay a profile's one-time slow-start
// cost (see DocxToPdfConverter for the measurements behind that). Failures are swallowed by
// design — a submission landing before warm-up finishes, or if it fails entirely, just
// warms its own slot on demand instead.
public class LibreOfficeWarmupService : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        _ = DocxToPdfConverter.WarmupAsync();
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
