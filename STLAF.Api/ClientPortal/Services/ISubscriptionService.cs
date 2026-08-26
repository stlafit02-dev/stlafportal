using STLAF.Api.ClientPortal.DTOs;

namespace STLAF.Api.ClientPortal.Services;

public interface ISubscriptionService
{
    Task<SubscriptionDto> GetMineAsync(Guid clientId);
}
