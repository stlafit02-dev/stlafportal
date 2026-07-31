using Microsoft.EntityFrameworkCore;
using STLAF.Api.Data;
using STLAF.Api.Identity.DTOs;

namespace STLAF.Api.Identity.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;
    private const int MaxFailedAttempts = 5;
    private const int LockoutMinutes = 15;

    public AuthService(AppDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    public async Task<LoginOutcome> LoginAsync(LoginRequestDto request)
    {
        var user = await _db.Users
            .Include(u => u.Department)
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => (u.Email == request.Email || u.Username == request.Email) && u.IsActive);

        if (user is null)
        {
            return new LoginOutcome { ErrorMessage = "Invalid email or password." };
        }

        if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
        {
            var minutesLeft = (int)Math.Ceiling((user.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes);
            return new LoginOutcome
            {
                ErrorMessage = $"Account locked due to too many failed attempts. Try again in {minutesLeft} minute(s)."
            };
        }

        var validPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

        if (!validPassword)
        {
            user.FailedLoginAttempts += 1;

            if (user.FailedLoginAttempts >= MaxFailedAttempts)
            {
                user.LockoutEnd = DateTime.UtcNow.AddMinutes(LockoutMinutes);
                user.FailedLoginAttempts = 0;
                await _db.SaveChangesAsync();

                return new LoginOutcome
                {
                    ErrorMessage = $"Account locked due to too many failed attempts. Try again in {LockoutMinutes} minutes."
                };
            }

            await _db.SaveChangesAsync();

            var remaining = MaxFailedAttempts - user.FailedLoginAttempts;
            return new LoginOutcome
            {
                ErrorMessage = $"Invalid email or password. {remaining} attempt(s) remaining before lockout."
            };
        }

        // Successful login — reset counters
        user.FailedLoginAttempts = 0;
        user.LockoutEnd = null;
        await _db.SaveChangesAsync();

        var (token, expiresAt) = _tokenService.GenerateToken(user, user.Department.Name, user.Role.Name);

        return new LoginOutcome
        {
            Result = new LoginResponseDto
            {
                Token = token,
                ExpiresAt = expiresAt,
                User = new UserInfoDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Department = user.Department.Name,
                    Role = user.Role.Name
                }
            }
        };
    }
}