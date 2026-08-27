using Microsoft.AspNetCore.Mvc;
using STLAF.Api.Identity.DTOs;
using STLAF.Api.Identity.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;

namespace STLAF.Api.Identity.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(LoginRequestDto request)
    {
        var outcome = await _authService.LoginAsync(request);

        if (outcome.Result is null)
            return Unauthorized(new { message = outcome.ErrorMessage ?? "Invalid email or password." });

        return Ok(outcome.Result);
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