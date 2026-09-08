using Microsoft.AspNetCore.Mvc;
using STLAF.Api.Identity.DTOs;
using STLAF.Api.Identity.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using STLAF.Api.Identity;

namespace STLAF.Api.Identity.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IWebHostEnvironment _environment;

    public AuthController(IAuthService authService, IWebHostEnvironment environment)
    {
        _authService = authService;
        _environment = environment;
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(LoginRequestDto request)
    {
        var outcome = await _authService.LoginAsync(request);

        if (outcome.Result is null)
            return Unauthorized(new { message = outcome.ErrorMessage ?? "Invalid email or password." });

        Response.Cookies.Append(
            AuthCookies.TokenCookieName,
            outcome.Result.Token,
            AuthCookies.BuildTokenOptions(_environment, outcome.Result.ExpiresAt));

        return Ok(new { outcome.Result.ExpiresAt, outcome.Result.User });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(AuthCookies.TokenCookieName, new CookieOptions { Path = "/" });
        return Ok(new { message = "Logged out." });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")!.Value);
        var (success, error) = await _authService.ChangePasswordAsync(userId, dto);

        if (!success) return BadRequest(new { message = error });
        return Ok(new { message = "Password updated successfully." });
    }
}