using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STLAF.Api.Departments.HRAdmin.DTOs;
using STLAF.Api.Departments.HRAdmin.Services;

namespace STLAF.Api.Departments.HRAdmin.Controllers;

[ApiController]
[Route("api/hr/reports")]
[Authorize(Policy = "hr-reports")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _service;

    public ReportsController(IReportService service)
    {
        _service = service;
    }

    [HttpGet("leave-overtime")]
    public async Task<IActionResult> GetLeaveOvertimeReport(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? department)
    {
        var filter = new ReportFilterDto { From = from, To = to, Department = department };
        var fileBytes = await _service.GenerateLeaveOvertimeReportAsync(filter);

        var fileName = $"Leave-Overtime-Report-{DateTime.UtcNow:yyyy-MM-dd}.xlsx";
        return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }
}