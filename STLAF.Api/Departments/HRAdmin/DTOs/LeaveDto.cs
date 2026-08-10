namespace STLAF.Api.Departments.HRAdmin.DTOs;

public class LeaveTypeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DefaultCredits { get; set; }
    public int? RequiresMedicalAfterDays { get; set; }
}

public class CreateLeaveTypeDto
{
    public string Name { get; set; } = string.Empty;
    public int DefaultCredits { get; set; }
    public int? RequiresMedicalAfterDays { get; set; }
}

public class UpdateLeaveTypeDto
{
    public string Name { get; set; } = string.Empty;
    public int DefaultCredits { get; set; }
    public int? RequiresMedicalAfterDays { get; set; }
}

public class LeaveApproverDto
{
    public Guid Id { get; set; }
    public string Department { get; set; } = string.Empty;
    public Guid ApproverEmployeeId { get; set; }
    public string ApproverName { get; set; } = string.Empty;
}

public class SetLeaveApproverDto
{
    public string Department { get; set; } = string.Empty;
    public Guid ApproverEmployeeId { get; set; }
}

public class LeaveBalanceDto
{
    public Guid LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty;
    public int DefaultCredits { get; set; }
    public int UsedCredits { get; set; }
    public int RemainingCredits { get; set; }
}

public class LeaveRequestDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string LeaveTypeName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int Days { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? DecidedByName { get; set; }
    public string? DecisionNotes { get; set; }
    public DateTime? DecidedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? RetractionReason { get; set; }
    public DateTime? RetractionRequestedAt { get; set; }
    public string? RetractionDecidedByName { get; set; }
    public string? RetractionDecisionNotes { get; set; }
    public DateTime? RetractionDecidedAt { get; set; }
    public bool IsPaid { get; set; }
}

public class CreateLeaveRequestDto
{
    public Guid LeaveTypeId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public bool IsPaid { get; set; }
}

public class DecideLeaveRequestDto
{
    public bool Approved { get; set; }
    public string? Notes { get; set; }
}

public class EmployeeProfileDto
{
    public string CompanyId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string OfficePosition { get; set; } = string.Empty;
}

// ---------- SMTP Senders (standalone, independent of GWS/Email Accounts) ----------

public class SmtpSenderDto
{
    public Guid Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class CreateSmtpSenderDto
{
    public string Label { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string AppPassword { get; set; } = string.Empty;
}

public class TestSmtpSenderResultDto
{
    public bool Success { get; set; }
    public string? Error { get; set; }
}

public class LeaveNotificationSettingDto
{
    public Guid SmtpSenderId { get; set; }
    public string SenderEmail { get; set; } = string.Empty;
    public string SenderLabel { get; set; } = string.Empty;
}

public class SetLeaveNotificationSettingDto
{
    public Guid SmtpSenderId { get; set; }
}
public class EmployeeLeaveCreditDto
{
    public Guid LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty;
    public int DefaultCredits { get; set; }
    public int? OverrideCredits { get; set; }
    public int EffectiveCredits { get; set; }
}

public class SetEmployeeLeaveCreditDto
{
    public Guid LeaveTypeId { get; set; }
    public int? Credits { get; set; } // null = remove override, fall back to default
}

public class RequestRetractionDto
{
    public string Reason { get; set; } = string.Empty;
}

public class DecideRetractionDto
{
    public bool Approved { get; set; }
    public string? Notes { get; set; }
}
public class MedicalCertificateDto
{
    public Guid Id { get; set; }
    public Guid LeaveRequestId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? DriveFileUrl { get; set; }
    public DateTime? UploadedAt { get; set; }
    public string? VerifiedByName { get; set; }
    public string? VerificationNotes { get; set; }
    public DateTime? VerifiedAt { get; set; }
}

public class VerifyMedicalCertificateDto
{
    public bool Approved { get; set; }
    public string? Notes { get; set; }
}