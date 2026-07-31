using STLAF.Api.Departments.HRAdmin.DTOs;

namespace STLAF.Api.Departments.HRAdmin.Services;

public interface ILeaveService
{
    // ---------- Leave Types ----------
    Task<List<LeaveTypeDto>> GetLeaveTypesAsync();
    Task<LeaveTypeDto> CreateLeaveTypeAsync(CreateLeaveTypeDto dto);
    Task<LeaveTypeDto?> UpdateLeaveTypeAsync(Guid id, UpdateLeaveTypeDto dto);

    // ---------- Approvers ----------
    Task<List<LeaveApproverDto>> GetApproversAsync();
    Task<LeaveApproverDto> SetApproverAsync(SetLeaveApproverDto dto);

    // ---------- SMTP Senders ----------
    Task<List<SmtpSenderDto>> GetSmtpSendersAsync();
    Task<SmtpSenderDto> CreateSmtpSenderAsync(CreateSmtpSenderDto dto);
    Task<TestSmtpSenderResultDto> TestSmtpSenderAsync(Guid id);

    // ---------- Notification Setting ----------
    Task<LeaveNotificationSettingDto?> GetNotificationSettingAsync();
    Task<LeaveNotificationSettingDto> SetNotificationSettingAsync(SetLeaveNotificationSettingDto dto);

    // ---------- Employee-facing ----------
    Task<EmployeeProfileDto?> GetMyProfileAsync(Guid userId);
    Task<List<LeaveBalanceDto>> GetMyBalancesAsync(Guid userId);
    Task<List<LeaveRequestDto>> GetMyRequestsAsync(Guid userId);
    Task<LeaveRequestDto> CreateRequestAsync(Guid userId, CreateLeaveRequestDto dto);

    // ---------- Approver-facing ----------
    Task<bool> IsApproverAsync(Guid userId);
    Task<List<LeaveRequestDto>> GetPendingApprovalsAsync(Guid userId);
    Task<LeaveRequestDto?> DecideRequestAsync(Guid userId, Guid requestId, DecideLeaveRequestDto dto);
    Task<bool> DeleteSmtpSenderAsync(Guid id);
    Task<List<EmployeeLeaveCreditDto>> GetEmployeeLeaveCreditsAsync(Guid employeeId);
    Task<List<EmployeeLeaveCreditDto>> SetEmployeeLeaveCreditAsync(Guid employeeId, SetEmployeeLeaveCreditDto dto);
    Task<LeaveRequestDto?> RequestRetractionAsync(Guid userId, Guid requestId, RequestRetractionDto dto);
    Task<List<LeaveRequestDto>> GetPendingRetractionsAsync(Guid userId);
    Task<LeaveRequestDto?> DecideRetractionAsync(Guid userId, Guid requestId, DecideRetractionDto dto);
}