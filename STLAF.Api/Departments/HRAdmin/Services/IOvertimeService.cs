using STLAF.Api.Departments.HRAdmin.DTOs;

namespace STLAF.Api.Departments.HRAdmin.Services;

public interface IOvertimeService
{
    Task<List<OvertimePartnerDto>> GetPartnersAsync();
    Task<OvertimePartnerDto> SetPartnerAsync(SetOvertimePartnerDto dto);

    Task<List<OvertimeRequestDto>> GetMyRequestsAsync(Guid userId);
    Task<OvertimeRequestDto> CreateRequestAsync(Guid userId, CreateOvertimeRequestDto dto);

    Task<bool> IsDeptApproverAsync(Guid userId);
    Task<List<OvertimeRequestDto>> GetPendingDeptApprovalsAsync(Guid userId);
    Task<OvertimeRequestDto?> DecideDeptAsync(Guid userId, Guid requestId, DecideOvertimeDto dto);

    Task<bool> IsPartnerAsync(Guid userId);
    Task<List<OvertimeRequestDto>> GetPendingPartnerApprovalsAsync(Guid userId);
    Task<OvertimeRequestDto?> DecidePartnerAsync(Guid userId, Guid requestId, DecideOvertimeDto dto);
}