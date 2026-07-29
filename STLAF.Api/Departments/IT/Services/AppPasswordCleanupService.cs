using STLAF.Api.Departments.IT.Services;

namespace STLAF.Api.Departments.IT.BackgroundJobs;

public class AppPasswordCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AppPasswordCleanupService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromHours(6);

    public AppPasswordCleanupService(IServiceScopeFactory scopeFactory, ILogger<AppPasswordCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var gmailService = scope.ServiceProvider.GetRequiredService<IGmailService>();
                var deletedCount = await gmailService.DeleteExpiredAppPasswordsAsync();

                if (deletedCount > 0)
                {
                    _logger.LogInformation("Deleted {Count} expired app password(s).", deletedCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "App password cleanup failed.");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }
}