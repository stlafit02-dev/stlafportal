using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.ClientPortal.Services;

namespace STLAF.Api.ClientPortal.Controllers;

[ApiController]
[Route("api/client-portal/auth")]
[AllowAnonymous]
public class ClientAuthController : ControllerBase
{
    private readonly IClientAuthService _authService;

    public ClientAuthController(IClientAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("signup")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Signup(ClientSignupDto dto)
    {
        var outcome = await _authService.SignupAsync(dto);
        if (outcome.Result is null)
            return BadRequest(new { message = outcome.ErrorMessage });

        return Ok(outcome.Result);
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(ClientLoginDto dto)
    {
        var outcome = await _authService.LoginAsync(dto);
        if (outcome.Result is null)
            return Unauthorized(new { message = outcome.ErrorMessage ?? "Invalid email or password." });

        return Ok(outcome.Result);
    }
}
