using STLAF.Api.Identity.DTOs;

namespace STLAF.Api.Identity.Services;

public interface IAuthService
{
    Task<LoginOutcome> LoginAsync(LoginRequestDto request);
    Task<(bool Success, string? ErrorMessage)> ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
}