using STLAF.Api.ClientPortal.DTOs;

namespace STLAF.Api.ClientPortal.Services;

public class ClientAuthOutcome
{
    public ClientAuthResponseDto? Result { get; set; }
    public string? ErrorMessage { get; set; }
}

public interface IClientAuthService
{
    Task<ClientAuthOutcome> SignupAsync(ClientSignupDto dto);
    Task<ClientAuthOutcome> LoginAsync(ClientLoginDto dto);
}
