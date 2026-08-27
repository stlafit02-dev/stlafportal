using Microsoft.EntityFrameworkCore;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.ClientPortal.Entities;
using STLAF.Api.Data;
using STLAF.Api.Identity.Services;

namespace STLAF.Api.ClientPortal.Services;

public class ClientAuthService : IClientAuthService
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;

    public ClientAuthService(AppDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    public async Task<ClientAuthOutcome> SignupAsync(ClientSignupDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.FullName))
        {
            return new ClientAuthOutcome { ErrorMessage = "Email and full name are required." };
        }

        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 8)
        {
            return new ClientAuthOutcome { ErrorMessage = "Password must be at least 8 characters." };
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var exists = await _db.ClientAccounts.AnyAsync(c => c.Email == normalizedEmail);
        if (exists)
        {
            return new ClientAuthOutcome { ErrorMessage = "An account with this email already exists." };
        }

        var client = new ClientAccount
        {
            Email = normalizedEmail,
            FullName = dto.FullName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _db.ClientAccounts.Add(client);

        _db.ClientPortalSubscriptions.Add(new Subscription
        {
            ClientAccountId = client.Id
        });

        await _db.SaveChangesAsync();

        var (token, expiresAt) = _tokenService.GenerateClientToken(client);
        return new ClientAuthOutcome
        {
            Result = new ClientAuthResponseDto
            {
                Token = token,
                ExpiresAt = expiresAt,
                Client = new ClientInfoDto { Id = client.Id, Email = client.Email, FullName = client.FullName }
            }
        };
    }

    public async Task<ClientAuthOutcome> LoginAsync(ClientLoginDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var client = await _db.ClientAccounts.FirstOrDefaultAsync(c => c.Email == normalizedEmail && c.IsActive);

        if (client is null || !BCrypt.Net.BCrypt.Verify(dto.Password, client.PasswordHash))
        {
            return new ClientAuthOutcome { ErrorMessage = "Invalid email or password." };
        }

        var (token, expiresAt) = _tokenService.GenerateClientToken(client);
        return new ClientAuthOutcome
        {
            Result = new ClientAuthResponseDto
            {
                Token = token,
                ExpiresAt = expiresAt,
                Client = new ClientInfoDto { Id = client.Id, Email = client.Email, FullName = client.FullName }
            }
        };
    }
}
