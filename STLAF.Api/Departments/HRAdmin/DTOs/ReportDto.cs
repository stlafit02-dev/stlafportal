namespace STLAF.Api.Departments.HRAdmin.DTOs;

public class ReportFilterDto
{
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public string? Department { get; set; } // null/"All" = every department
}