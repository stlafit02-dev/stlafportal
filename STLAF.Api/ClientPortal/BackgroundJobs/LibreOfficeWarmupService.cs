using STLAF.Api.ClientPortal.Services;

namespace STLAF.Api.ClientPortal.BackgroundJobs;

public class LibreOfficeWarmupService : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        _ = DocxToPdfConverter.WarmupAsync();
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
