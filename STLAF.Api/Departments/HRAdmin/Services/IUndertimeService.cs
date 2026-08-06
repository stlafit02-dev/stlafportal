using STLAF.Api.Departments.HRAdmin.DTOs;

namespace STLAF.Api.Departments.HRAdmin.Services;

public interface IUndertimeService
{
    Task<List<UndertimeRequestDto>> GetMyRequestsAsync(Guid userId);
    Task<UndertimeRequestDto> CreateRequestAsync(Guid userId, CreateUndertimeRequestDto dto);

    Task<bool> IsApproverAsync(Guid userId);
    Task<List<UndertimeRequestDto>> GetPendingApprovalsAsync(Guid userId);
    Task<UndertimeRequestDto?> DecideAsync(Guid userId, Guid requestId, DecideUndertimeDto dto);
}