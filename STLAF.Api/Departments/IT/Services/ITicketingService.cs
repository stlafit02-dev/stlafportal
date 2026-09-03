using STLAF.Api.Departments.IT.DTOs;

namespace STLAF.Api.Departments.IT.Services;

public interface ITicketingService
{
    Task<List<TicketDto>> GetOpenQueueAsync();
    Task<List<TicketDto>> GetAllAsync();
    Task<byte[]> ExportTicketsAsync(string? status, string? search, string? month);
    Task<TicketSummaryDto> GetSummaryAsync();
    Task<TicketDto> CreateAsync(CreateTicketDto dto);
    Task<TicketDto?> UpdateStatusAsync(Guid ticketId, string status);
    Task<TicketDto?> AddRemarkAsync(Guid ticketId, string remarks);
    Task<TicketDto?> AssignAsync(Guid ticketId, Guid? assignedToId);
    Task<List<ItStaffDto>> GetItStaffAsync();
    Task<EmployeeTicketProfileDto?> GetMyProfileAsync(Guid userId);
    Task<List<TicketDto>> GetMyTicketsAsync(Guid userId);
    Task<TicketDto> CreateFromPortalAsync(Guid userId, CreatePortalTicketDto dto);
    Task<bool> DeleteAsync(Guid ticketId);
}