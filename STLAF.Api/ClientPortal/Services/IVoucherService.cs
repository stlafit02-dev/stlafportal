using STLAF.Api.ClientPortal.DTOs;

namespace STLAF.Api.ClientPortal.Services;

public interface IVoucherService
{
    Task<(RedeemVoucherResultDto? Result, string? Error)> RedeemAsync(Guid clientId, string code);
    Task<VoucherCodeDto> GenerateAsync(Guid staffUserId, GenerateVoucherDto dto);
    Task<List<VoucherCodeDto>> ListAsync();
}
