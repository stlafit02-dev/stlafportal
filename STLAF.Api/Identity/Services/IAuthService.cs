using STLAF.Api.Identity.DTOs;

namespace STLAF.Api.Identity.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
}