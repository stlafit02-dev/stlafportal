using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using STLAF.Api.Data;
using STLAF.Api.Departments.HRAdmin.DTOs;

namespace STLAF.Api.Departments.HRAdmin.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _db;

    public ReportService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<byte[]> GenerateLeaveOvertimeReportAsync(ReportFilterDto filter)
    {
        var leaveQuery = _db.LeaveRequests
            .Include(r => r.Employee)
            .Include(r => r.LeaveType)
            .Include(r => r.DecidedByEmployee)
            .AsQueryable();

        var overtimeQuery = _db.OvertimeRequests
            .Include(r => r.Employee)
            .Include(r => r.DeptDecidedByEmployee)
            .Include(r => r.PartnerDecidedByEmployee)
            .AsQueryable();

        var undertimeQuery = _db.UndertimeRequests
            .Include(r => r.Employee)
            .Include(r => r.DecidedByEmployee)
            .AsQueryable();

        if (filter.From.HasValue)
        {
            var from = DateTime.SpecifyKind(filter.From.Value, DateTimeKind.Utc);
            leaveQuery = leaveQuery.Where(r => r.StartDate >= from);
            overtimeQuery = overtimeQuery.Where(r => r.Date >= from);
            undertimeQuery = undertimeQuery.Where(r => r.Date >= from);
        }

        if (filter.To.HasValue)
        {
            var to = DateTime.SpecifyKind(filter.To.Value, DateTimeKind.Utc);
            leaveQuery = leaveQuery.Where(r => r.StartDate <= to);
            overtimeQuery = overtimeQuery.Where(r => r.Date <= to);
            undertimeQuery = undertimeQuery.Where(r => r.Date <= to);
        }

        if (!string.IsNullOrWhiteSpace(filter.Department) && filter.Department != "All")
        {
            leaveQuery = leaveQuery.Where(r => r.Employee.Department == filter.Department);
            overtimeQuery = overtimeQuery.Where(r => r.Employee.Department == filter.Department);
            undertimeQuery = undertimeQuery.Where(r => r.Employee.Department == filter.Department);
        }

        var leaveRequests = await leaveQuery.OrderBy(r => r.StartDate).ToListAsync();
        var overtimeRequests = await overtimeQuery.OrderBy(r => r.Date).ToListAsync();
        var undertimeRequests = await undertimeQuery.OrderBy(r => r.Date).ToListAsync();

        using var workbook = new XLWorkbook();

        // ---------- Leave sheet ----------
        var leaveSheet = workbook.Worksheets.Add("Leave Requests");
        string[] leaveHeaders = { "Company ID", "Employee", "Department", "Leave Type", "Start Date", "End Date", "Days", "Reason", "Status", "Decided By", "Decision Notes", "Decided At", "Submitted" };
        for (var i = 0; i < leaveHeaders.Length; i++)
        {
            leaveSheet.Cell(1, i + 1).Value = leaveHeaders[i];
            leaveSheet.Cell(1, i + 1).Style.Font.Bold = true;
            leaveSheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#1A2634");
            leaveSheet.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
        }

        var leaveRow = 2;
        foreach (var r in leaveRequests)
        {
            leaveSheet.Cell(leaveRow, 1).Value = r.Employee.CompanyId;
            leaveSheet.Cell(leaveRow, 2).Value = $"{r.Employee.FirstName} {r.Employee.LastName}";
            leaveSheet.Cell(leaveRow, 3).Value = r.Employee.Department;
            leaveSheet.Cell(leaveRow, 4).Value = r.LeaveType.Name;
            leaveSheet.Cell(leaveRow, 5).Value = r.StartDate.ToString("yyyy-MM-dd");
            leaveSheet.Cell(leaveRow, 6).Value = r.EndDate.ToString("yyyy-MM-dd");
            leaveSheet.Cell(leaveRow, 7).Value = r.Days;
            leaveSheet.Cell(leaveRow, 8).Value = r.Reason;
            leaveSheet.Cell(leaveRow, 9).Value = r.Status;
            leaveSheet.Cell(leaveRow, 10).Value = r.DecidedByEmployee is null ? "" : $"{r.DecidedByEmployee.FirstName} {r.DecidedByEmployee.LastName}";
            leaveSheet.Cell(leaveRow, 11).Value = r.DecisionNotes ?? "";
            leaveSheet.Cell(leaveRow, 12).Value = r.DecidedAt?.ToString("yyyy-MM-dd HH:mm") ?? "";
            leaveSheet.Cell(leaveRow, 13).Value = r.CreatedAt.ToString("yyyy-MM-dd HH:mm");
            leaveRow++;
        }
        leaveSheet.Columns().AdjustToContents();
        leaveSheet.SheetView.FreezeRows(1);

        // ---------- Overtime sheet ----------
        var otSheet = workbook.Worksheets.Add("Overtime Requests");
        string[] otHeaders = { "Company ID", "Employee", "Department", "Date", "Time In", "Time Out", "Hours", "Reason", "Status", "Dept Head", "Dept Notes", "Dept Decided At", "Partner", "Partner Notes", "Partner Decided At", "Submitted" };
        for (var i = 0; i < otHeaders.Length; i++)
        {
            otSheet.Cell(1, i + 1).Value = otHeaders[i];
            otSheet.Cell(1, i + 1).Style.Font.Bold = true;
            otSheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#1A2634");
            otSheet.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
        }

        var otRow = 2;
        foreach (var r in overtimeRequests)
        {
            otSheet.Cell(otRow, 1).Value = r.Employee.CompanyId;
            otSheet.Cell(otRow, 2).Value = $"{r.Employee.FirstName} {r.Employee.LastName}";
            otSheet.Cell(otRow, 3).Value = r.Employee.Department;
            otSheet.Cell(otRow, 4).Value = r.Date.ToString("yyyy-MM-dd");
            otSheet.Cell(otRow, 5).Value = r.StartTime.ToString("HH:mm");
            otSheet.Cell(otRow, 6).Value = r.EndTime.ToString("HH:mm");
            otSheet.Cell(otRow, 7).Value = r.Hours;
            otSheet.Cell(otRow, 8).Value = r.Reason;
            otSheet.Cell(otRow, 9).Value = r.Status;
            otSheet.Cell(otRow, 10).Value = r.DeptDecidedByEmployee is null ? "" : $"{r.DeptDecidedByEmployee.FirstName} {r.DeptDecidedByEmployee.LastName}";
            otSheet.Cell(otRow, 11).Value = r.DeptDecisionNotes ?? "";
            otSheet.Cell(otRow, 12).Value = r.DeptDecidedAt?.ToString("yyyy-MM-dd HH:mm") ?? "";
            otSheet.Cell(otRow, 13).Value = r.PartnerDecidedByEmployee is null ? "" : $"{r.PartnerDecidedByEmployee.FirstName} {r.PartnerDecidedByEmployee.LastName}";
            otSheet.Cell(otRow, 14).Value = r.PartnerDecisionNotes ?? "";
            otSheet.Cell(otRow, 15).Value = r.PartnerDecidedAt?.ToString("yyyy-MM-dd HH:mm") ?? "";
            otSheet.Cell(otRow, 16).Value = r.CreatedAt.ToString("yyyy-MM-dd HH:mm");
            otRow++;
        }
        otSheet.Columns().AdjustToContents();
        otSheet.SheetView.FreezeRows(1);

        // ---------- Undertime sheet ----------
        var utSheet = workbook.Worksheets.Add("Undertime Requests");
        string[] utHeaders = { "Company ID", "Employee", "Department", "Date", "Time In", "Time Out", "Hours", "Reason", "Status", "Decided By", "Decision Notes", "Decided At", "Submitted" };
        for (var i = 0; i < utHeaders.Length; i++)
        {
            utSheet.Cell(1, i + 1).Value = utHeaders[i];
            utSheet.Cell(1, i + 1).Style.Font.Bold = true;
            utSheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#1A2634");
            utSheet.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
        }

        var utRow = 2;
        foreach (var r in undertimeRequests)
        {
            utSheet.Cell(utRow, 1).Value = r.Employee.CompanyId;
            utSheet.Cell(utRow, 2).Value = $"{r.Employee.FirstName} {r.Employee.LastName}";
            utSheet.Cell(utRow, 3).Value = r.Employee.Department;
            utSheet.Cell(utRow, 4).Value = r.Date.ToString("yyyy-MM-dd");
            utSheet.Cell(utRow, 5).Value = r.StartTime.ToString("HH:mm");
            utSheet.Cell(utRow, 6).Value = r.EndTime.ToString("HH:mm");
            utSheet.Cell(utRow, 7).Value = r.Hours;
            utSheet.Cell(utRow, 8).Value = r.Reason;
            utSheet.Cell(utRow, 9).Value = r.Status;
            utSheet.Cell(utRow, 10).Value = r.DecidedByEmployee is null ? "" : $"{r.DecidedByEmployee.FirstName} {r.DecidedByEmployee.LastName}";
            utSheet.Cell(utRow, 11).Value = r.DecisionNotes ?? "";
            utSheet.Cell(utRow, 12).Value = r.DecidedAt?.ToString("yyyy-MM-dd HH:mm") ?? "";
            utSheet.Cell(utRow, 13).Value = r.CreatedAt.ToString("yyyy-MM-dd HH:mm");
            utRow++;
        }
        utSheet.Columns().AdjustToContents();
        utSheet.SheetView.FreezeRows(1);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}