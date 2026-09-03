using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using STLAF.Api.Data;
using STLAF.Api.Departments.HRAdmin.Entities;
using STLAF.Api.Departments.IT.DTOs;
using STLAF.Api.Departments.IT.Entities;

namespace STLAF.Api.Departments.IT.Services;

public class TicketingService : ITicketingService
{
    private readonly AppDbContext _db;

    public TicketingService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<TicketDto>> GetOpenQueueAsync()
    {
        var tickets = await _db.Tickets
            .Where(t => t.Status != "Closed")
            .OrderByDescending(t => t.DateSubmitted)
            .ToListAsync();

        return await ToDtoListAsync(tickets);
    }

    public async Task<List<TicketDto>> GetAllAsync()
    {
        var tickets = await _db.Tickets
            .OrderByDescending(t => t.DateSubmitted)
            .ToListAsync();

        return await ToDtoListAsync(tickets);
    }

    public async Task<byte[]> ExportTicketsAsync(string? status, string? search, string? month)
    {
        var query = _db.Tickets.AsQueryable();

        if (!string.IsNullOrWhiteSpace(month) &&
            DateTime.TryParseExact(month, "yyyy-MM", null, System.Globalization.DateTimeStyles.None, out var monthStart))
        {
            var start = DateTime.SpecifyKind(monthStart, DateTimeKind.Utc);
            var end = start.AddMonths(1);
            query = query.Where(t => t.DateSubmitted >= start && t.DateSubmitted < end);
        }

        var tickets = await query
            .OrderByDescending(t => t.DateSubmitted)
            .ToListAsync();

        var dtos = await ToDtoListAsync(tickets);

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            dtos = dtos.Where(t => t.Status == status).ToList();
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            dtos = dtos.Where(t =>
                t.TicketNumber.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                t.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                t.CompanyEmail.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                t.Category.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)
            ).ToList();
        }

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Tickets");

        string[] headers = { "Ticket #", "Requester", "Email", "Viber", "Category", "Priority", "Status", "Department", "Assigned To", "Description", "Remarks", "Submitted", "Closed" };
        for (var i = 0; i < headers.Length; i++)
        {
            sheet.Cell(1, i + 1).Value = headers[i];
            sheet.Cell(1, i + 1).Style.Font.Bold = true;
            sheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#1A2634");
            sheet.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
        }

        var row = 2;
        foreach (var t in dtos)
        {
            sheet.Cell(row, 1).Value = t.TicketNumber;
            sheet.Cell(row, 2).Value = t.Name;
            sheet.Cell(row, 3).Value = t.CompanyEmail;
            sheet.Cell(row, 4).Value = t.ViberNumber ?? "";
            sheet.Cell(row, 5).Value = t.Category;
            sheet.Cell(row, 6).Value = t.Priority;
            sheet.Cell(row, 7).Value = t.Status;
            sheet.Cell(row, 8).Value = t.Department;
            sheet.Cell(row, 9).Value = t.AssignedToName ?? "Unassigned";
            sheet.Cell(row, 10).Value = t.Description;
            sheet.Cell(row, 11).Value = t.Remarks ?? "";
            sheet.Cell(row, 12).Value = t.DateSubmitted.ToString("yyyy-MM-dd HH:mm");
            sheet.Cell(row, 13).Value = t.Status == "Closed" ? t.UpdatedDate.ToString("yyyy-MM-dd HH:mm") : "";
            row++;
        }

        sheet.Columns().AdjustToContents();
        sheet.SheetView.FreezeRows(1);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public async Task<TicketSummaryDto> GetSummaryAsync()
    {
        var tickets = await _db.Tickets.ToListAsync();

        return new TicketSummaryDto
        {
            Open = tickets.Count(t => t.Status == "Open"),
            InProgress = tickets.Count(t => t.Status == "In Progress"),
            OnHold = tickets.Count(t => t.Status == "On Hold"),
            Resolved = tickets.Count(t => t.Status == "Resolved"),
            Closed = tickets.Count(t => t.Status == "Closed"),
        };
    }

    public async Task<TicketDto> CreateAsync(CreateTicketDto dto)
    {
        var ticketNumber = await GenerateTicketNumberAsync();

        var ticket = new Ticket
        {
            TicketNumber = ticketNumber,
            Name = dto.Name,
            CompanyEmail = dto.CompanyEmail,
            ViberNumber = dto.ViberNumber,
            Description = dto.Description,
            Category = dto.Category,
            Priority = dto.Priority,
            Status = "Open",
            Department = dto.Department,
            DateSubmitted = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        _db.Tickets.Add(ticket);
        await _db.SaveChangesAsync();

        var list = await ToDtoListAsync(new List<Ticket> { ticket });
        return list[0];
    }

    public async Task<TicketDto?> UpdateStatusAsync(Guid ticketId, string status)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);
        if (ticket is null) return null;

        ticket.Status = status;
        ticket.UpdatedDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var list = await ToDtoListAsync(new List<Ticket> { ticket });
        return list[0];
    }

    public async Task<TicketDto?> AddRemarkAsync(Guid ticketId, string remarks)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);
        if (ticket is null) return null;

        if (!string.IsNullOrWhiteSpace(remarks))
        {
            var timestamp = DateTime.UtcNow.ToString("MMM d, yyyy h:mm tt");
            var entry = $"[{timestamp}] {remarks}";
            ticket.Remarks = string.IsNullOrWhiteSpace(ticket.Remarks)
                ? entry
                : $"{ticket.Remarks}\n{entry}";
            await _db.SaveChangesAsync();
        }

        var list = await ToDtoListAsync(new List<Ticket> { ticket });
        return list[0];
    }

    public async Task<TicketDto?> AssignAsync(Guid ticketId, Guid? assignedToId)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);
        if (ticket is null) return null;

        ticket.AssignedTo = assignedToId;
        ticket.UpdatedDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var list = await ToDtoListAsync(new List<Ticket> { ticket });
        return list[0];
    }

    public async Task<List<ItStaffDto>> GetItStaffAsync()
    {
        return await _db.Users
            .Where(u => u.Department.Name == "IT" && u.IsActive)
            .Select(u => new ItStaffDto { Id = u.Id, FullName = u.FullName })
            .ToListAsync();
    }

    public async Task<bool> DeleteAsync(Guid ticketId)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);
        if (ticket is null) return false;

        _db.Tickets.Remove(ticket);
        await _db.SaveChangesAsync();
        return true;
    }

    // ---------- Portal (employee self-service) ----------

    public async Task<EmployeeTicketProfileDto?> GetMyProfileAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return null;

        return new EmployeeTicketProfileDto
        {
            FullName = $"{employee.FirstName} {employee.LastName}",
            CompanyEmail = employee.CompanyEmail ?? employee.PersonalEmail ?? "",
            ViberNumber = employee.MobileNumber,
            Department = employee.Department
        };
    }

    public async Task<List<TicketDto>> GetMyTicketsAsync(Guid userId)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee is null) return new List<TicketDto>();

        var tickets = await _db.Tickets
            .Where(t => t.SubmittedByEmployeeId == employee.Id)
            .OrderByDescending(t => t.DateSubmitted)
            .ToListAsync();

        return await ToDtoListAsync(tickets);
    }

    public async Task<TicketDto> CreateFromPortalAsync(Guid userId, CreatePortalTicketDto dto)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId)
            ?? throw new InvalidOperationException("No employee record linked to this account.");

        var ticketNumber = await GenerateTicketNumberAsync();

        var ticket = new Ticket
        {
            TicketNumber = ticketNumber,
            Name = $"{employee.FirstName} {employee.LastName}",
            CompanyEmail = employee.CompanyEmail ?? employee.PersonalEmail ?? "",
            ViberNumber = employee.MobileNumber,
            Description = dto.Description,
            Category = dto.Category,
            Priority = dto.Priority,
            Status = "Open",
            Department = employee.Department,
            DateSubmitted = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow,
            SubmittedByEmployeeId = employee.Id
        };

        _db.Tickets.Add(ticket);
        await _db.SaveChangesAsync();

        var list = await ToDtoListAsync(new List<Ticket> { ticket });
        return list[0];
    }

    // ---------- Helpers ----------

    private async Task<string> GenerateTicketNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var countThisYear = await _db.Tickets.CountAsync(t => t.DateSubmitted.Year == year);
        return $"TKT-{year}-{(countThisYear + 1):D2}";
    }

    private async Task<List<TicketDto>> ToDtoListAsync(List<Ticket> tickets)
    {
        var assigneeIds = tickets
            .Where(t => t.AssignedTo.HasValue)
            .Select(t => t.AssignedTo!.Value)
            .Distinct()
            .ToList();

        var assignees = await _db.Users
            .Where(u => assigneeIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.FullName);

        return tickets.Select(t => new TicketDto
        {
            Id = t.Id,
            TicketNumber = t.TicketNumber,
            Name = t.Name,
            CompanyEmail = t.CompanyEmail,
            ViberNumber = t.ViberNumber,
            Description = t.Description,
            Category = t.Category,
            Priority = t.Priority,
            Status = t.Status,
            Department = t.Department,
            AssignedToId = t.AssignedTo,
            AssignedToName = t.AssignedTo.HasValue && assignees.TryGetValue(t.AssignedTo.Value, out var name)
      ? name
      : null,
            DateSubmitted = t.DateSubmitted,
            UpdatedDate = t.UpdatedDate,
            Remarks = t.Remarks
        }).ToList();
    }
}