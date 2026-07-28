using STLAF.Api.Departments.IT.DTOs;

namespace STLAF.Api.Departments.IT.Services;

public interface ITicketingService
{
    Task<List<TicketDto>> GetOpenQueueAsync();
    Task<List<TicketDto>> GetAllAsync();
    Task<TicketSummaryDto> GetSummaryAsync();
    Task<TicketDto> CreateAsync(CreateTicketDto dto);
    Task<TicketDto?> UpdateStatusAsync(Guid ticketId, string status);
    Task<TicketDto?> AssignAsync(Guid ticketId, Guid? assignedToId);
    Task<List<ItStaffDto>> GetItStaffAsync();
    Task<bool> DeleteAsync(Guid ticketId);
}