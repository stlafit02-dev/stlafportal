using Microsoft.AspNetCore.Mvc;
using STLAF.Api.Identity.DTOs;
using STLAF.Api.Identity.Services;

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
    public async Task<IActionResult> Login(LoginRequestDto request)
    {
        var outcome = await _authService.LoginAsync(request);

        if (outcome.Result is null)
            return Unauthorized(new { message = outcome.ErrorMessage ?? "Invalid email or password." });

        return Ok(outcome.Result);
    }
}