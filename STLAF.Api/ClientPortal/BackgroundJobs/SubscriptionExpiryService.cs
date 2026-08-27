using Microsoft.EntityFrameworkCore;
using STLAF.Api.Data;

namespace STLAF.Api.ClientPortal.BackgroundJobs;

public class SubscriptionExpiryService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SubscriptionExpiryService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(15);

    public SubscriptionExpiryService(IServiceScopeFactory scopeFactory, ILogger<SubscriptionExpiryService> logger)
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
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var now = DateTime.UtcNow;

                var revertedCount = await db.ClientPortalSubscriptions
                    .Where(s => s.Status == "active" && s.Plan == "premium" && s.ExpiresAt != null && s.ExpiresAt <= now)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(x => x.Plan, "free")
                        .SetProperty(x => x.Status, "expired")
                        .SetProperty(x => x.VoucherCodeId, (Guid?)null)
                        .SetProperty(x => x.UpdatedAt, now), stoppingToken);

                if (revertedCount > 0)
                {
                    _logger.LogInformation("Reverted {Count} expired premium subscription(s) to free.", revertedCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Subscription expiry sweep failed.");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }
}
