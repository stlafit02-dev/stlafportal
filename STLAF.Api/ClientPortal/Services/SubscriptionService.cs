using Microsoft.EntityFrameworkCore;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.Data;

namespace STLAF.Api.ClientPortal.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly AppDbContext _db;

    public SubscriptionService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<SubscriptionDto> GetMineAsync(Guid clientId)
    {
        var subscription = await _db.ClientPortalSubscriptions.FirstOrDefaultAsync(s => s.ClientAccountId == clientId);
        if (subscription is null)
        {
            return new SubscriptionDto { Plan = "free", Status = "active", ExpiresAt = null };
        }

        return new SubscriptionDto
        {
            Plan = subscription.Plan,
            Status = subscription.Status,
            ExpiresAt = subscription.ExpiresAt
        };
    }
}
