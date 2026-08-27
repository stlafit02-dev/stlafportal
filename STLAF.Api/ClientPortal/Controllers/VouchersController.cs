using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.ClientPortal.Services;

namespace STLAF.Api.ClientPortal.Controllers;

[ApiController]
[Route("api/client-portal/vouchers")]
public class VouchersController : ControllerBase
{
    private readonly IVoucherService _service;

    public VouchersController(IVoucherService service)
    {
        _service = service;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")!.Value);

    [HttpPost("redeem")]
    [Authorize(Policy = "ClientAccount")]
    public async Task<IActionResult> Redeem(RedeemVoucherDto dto)
    {
        var (result, error) = await _service.RedeemAsync(CurrentUserId, dto.Code);
        if (result is null) return BadRequest(new { message = error });
        return Ok(result);
    }

    [HttpPost("generate")]
    [Authorize(Policy = "client-portal-admin")]
    public async Task<IActionResult> Generate(GenerateVoucherDto dto) => Ok(await _service.GenerateAsync(CurrentUserId, dto));

    [HttpGet]
    [Authorize(Policy = "client-portal-admin")]
    public async Task<IActionResult> List() => Ok(await _service.ListAsync());
}
