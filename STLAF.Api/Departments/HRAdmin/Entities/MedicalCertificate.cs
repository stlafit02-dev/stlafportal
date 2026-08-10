using STLAF.Api.Common.Entities;

namespace STLAF.Api.Departments.HRAdmin.Entities;

public class MedicalCertificate : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public Guid LeaveRequestId { get; set; }
    public LeaveRequest LeaveRequest { get; set; } = null!;

    public string Status { get; set; } = "PendingUpload"; // PendingUpload, PendingVerification, Verified, Rejected

    public string? DriveFileId { get; set; }
    public string? DriveFileUrl { get; set; }
    public DateTime? UploadedAt { get; set; }

    public Guid? VerifiedByEmployeeId { get; set; }
    public Employee? VerifiedByEmployee { get; set; }
    public string? VerificationNotes { get; set; }
    public DateTime? VerifiedAt { get; set; }
}