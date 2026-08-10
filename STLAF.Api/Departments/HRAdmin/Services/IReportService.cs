using STLAF.Api.Departments.HRAdmin.DTOs;

namespace STLAF.Api.Departments.HRAdmin.Services;

public interface IReportService
{
    Task<byte[]> GenerateLeaveOvertimeReportAsync(ReportFilterDto filter);
}