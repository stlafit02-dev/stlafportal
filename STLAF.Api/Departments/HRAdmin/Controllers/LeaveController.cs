using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.Departments.HRAdmin.DTOs;
using STLAF.Api.Departments.HRAdmin.Services;
using STLAF.Api.Common.Services;

namespace STLAF.Api.Departments.HRAdmin.Controllers;

[ApiController]
[Route("api/leave")]
[Authorize]
public class LeaveController : ControllerBase
{
    private readonly ILeaveService _service;

    public LeaveController(ILeaveService service)
    {
        _service = service;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")!.Value);

    // ---------- Any authenticated employee ----------

    [HttpGet("my-profile")]
    public async Task<IActionResult> GetMyProfile()
    {
        var profile = await _service.GetMyProfileAsync(CurrentUserId);
        if (profile is null) return NotFound();
        return Ok(profile);
    }

    [HttpGet("types")]
    public async Task<IActionResult> GetTypes() => Ok(await _service.GetLeaveTypesAsync());

    [HttpGet("my-balances")]
    public async Task<IActionResult> GetMyBalances() => Ok(await _service.GetMyBalancesAsync(CurrentUserId));

    [HttpGet("my-requests")]
    public async Task<IActionResult> GetMyRequests() => Ok(await _service.GetMyRequestsAsync(CurrentUserId));

    [HttpPost("requests")]
    public async Task<IActionResult> CreateRequest(CreateLeaveRequestDto dto)
    {
        try
        {
            var request = await _service.CreateRequestAsync(CurrentUserId, dto);
            return Ok(request);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpGet("am-i-approver")]
    public async Task<IActionResult> AmIApprover() => Ok(new { isApprover = await _service.IsApproverAsync(CurrentUserId) });

    [HttpGet("pending-approvals")]
    public async Task<IActionResult> GetPendingApprovals() => Ok(await _service.GetPendingApprovalsAsync(CurrentUserId));

    [HttpPost("requests/{id}/decide")]
    public async Task<IActionResult> Decide(Guid id, DecideLeaveRequestDto dto)
    {
        var result = await _service.DecideRequestAsync(CurrentUserId, id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }

    // ---------- HR-only settings ----------

    [HttpPost("types")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> CreateType(CreateLeaveTypeDto dto) => Ok(await _service.CreateLeaveTypeAsync(dto));

    [HttpPut("types/{id}")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> UpdateType(Guid id, UpdateLeaveTypeDto dto)
    {
        var result = await _service.UpdateLeaveTypeAsync(id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet("approvers")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> GetApprovers() => Ok(await _service.GetApproversAsync());

    [HttpPost("approvers")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> SetApprover(SetLeaveApproverDto dto) => Ok(await _service.SetApproverAsync(dto));

    [HttpGet("notification-setting")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> GetNotificationSetting() => Ok(await _service.GetNotificationSettingAsync());

    [HttpPut("notification-setting")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> SetNotificationSetting(SetLeaveNotificationSettingDto dto) => Ok(await _service.SetNotificationSettingAsync(dto));
    [HttpGet("smtp-senders")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> GetSmtpSenders() => Ok(await _service.GetSmtpSendersAsync());

    [HttpPost("smtp-senders")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> CreateSmtpSender(CreateSmtpSenderDto dto) => Ok(await _service.CreateSmtpSenderAsync(dto));

    [HttpPost("smtp-senders/{id}/test")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> TestSmtpSender(Guid id) => Ok(await _service.TestSmtpSenderAsync(id));
    [HttpDelete("smtp-senders/{id}")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> DeleteSmtpSender(Guid id)
    {
        var deleted = await _service.DeleteSmtpSenderAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
    [HttpGet("employees/{employeeId}/credits")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> GetEmployeeLeaveCredits(Guid employeeId) =>
    Ok(await _service.GetEmployeeLeaveCreditsAsync(employeeId));

    [HttpPut("employees/{employeeId}/credits")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> SetEmployeeLeaveCredit(Guid employeeId, SetEmployeeLeaveCreditDto dto) =>
        Ok(await _service.SetEmployeeLeaveCreditAsync(employeeId, dto));
    [HttpPost("requests/{id}/request-retraction")]
    public async Task<IActionResult> RequestRetraction(Guid id, RequestRetractionDto dto)
    {
        var result = await _service.RequestRetractionAsync(CurrentUserId, id, dto);
        if (result is null) return BadRequest(new { message = "This request cannot be retracted." });
        return Ok(result);
    }

    [HttpGet("pending-retractions")]
    public async Task<IActionResult> GetPendingRetractions() => Ok(await _service.GetPendingRetractionsAsync(CurrentUserId));

    [HttpPost("requests/{id}/decide-retraction")]
    public async Task<IActionResult> DecideRetraction(Guid id, DecideRetractionDto dto)
    {
        var result = await _service.DecideRetractionAsync(CurrentUserId, id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }
    [HttpGet("medical-block-status")]
    public async Task<IActionResult> GetMedicalBlockStatus() => Ok(new { isBlocked = await _service.HasBlockingMedicalCertificateAsync(CurrentUserId) });

    [HttpGet("my-medical-certificates")]
    public async Task<IActionResult> GetMyMedicalCertificates() => Ok(await _service.GetMyMedicalCertificatesAsync(CurrentUserId));

    [HttpGet("medical-certificates/pending")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> GetPendingMedicalVerifications() => Ok(await _service.GetPendingMedicalVerificationsAsync());

    [HttpPost("medical-certificates/{id}/upload")]
    public async Task<IActionResult> UploadMedicalCertificate(Guid id, IFormFile file)
    {
        if (file is null || file.Length == 0) return BadRequest(new { message = "No file provided." });

        const long maxSizeBytes = 3_670_016; // 3.5 MB
        if (file.Length > maxSizeBytes)
            return BadRequest(new { message = "File is too large. Maximum size is 3.5 MB." });

        var isPdf = file.ContentType == "application/pdf"
            || file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase);
        if (!isPdf)
            return BadRequest(new { message = "Only PDF files are accepted." });

        try
        {
            using var stream = file.OpenReadStream();
            var result = await _service.UploadMedicalCertificateAsync(CurrentUserId, id, stream, file.FileName, file.ContentType);
            if (result is null) return NotFound();
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPost("medical-certificates/{id}/verify")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> VerifyMedicalCertificate(Guid id, VerifyMedicalCertificateDto dto)
    {
        var result = await _service.VerifyMedicalCertificateAsync(CurrentUserId, id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }
    [HttpPost("test-file-storage")]
    [Authorize(Policy = "HRAdmin")]
    public async Task<IActionResult> TestFileStorage([FromServices] IFileStorageService fileStorage)
    {
        var (success, error) = await fileStorage.TestConnectionAsync();
        return Ok(new { success, error });
    }
}