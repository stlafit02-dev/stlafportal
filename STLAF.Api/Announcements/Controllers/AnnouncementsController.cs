using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.Announcements.DTOs;
using STLAF.Api.Announcements.Services;
using System.Security.Claims;

namespace STLAF.Api.Announcements.Controllers;

[ApiController]
[Route("api/announcements")]
public class AnnouncementsController : ControllerBase
{
    private readonly IAnnouncementService _service;

    public AnnouncementsController(IAnnouncementService service)
    {
        _service = service;
    }

    // Public — landing page needs this without login
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var announcements = await _service.GetAllAsync();
        return Ok(announcements);
    }

    // Only authenticated users can post; refine to DeptAdmin/SuperAdmin later
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(CreateAnnouncementDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value!);
        var result = await _service.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetAll), result);
    }
}