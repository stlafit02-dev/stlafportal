using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.HRAdmin.Entities;

namespace STLAF.Api.Data.Configurations.HRAdmin;

public class MedicalCertificateConfiguration : IEntityTypeConfiguration<MedicalCertificate>
{
    public void Configure(EntityTypeBuilder<MedicalCertificate> builder)
    {
        builder.ToTable("hr_medical_certificates");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.LeaveRequestId).HasColumnName("leave_request_id");
        builder.Property(x => x.Status).HasColumnName("status");
        builder.Property(x => x.DriveFileId).HasColumnName("drive_file_id");
        builder.Property(x => x.DriveFileUrl).HasColumnName("drive_file_url");
        builder.Property(x => x.UploadedAt).HasColumnName("uploaded_at");
        builder.Property(x => x.VerifiedByEmployeeId).HasColumnName("verified_by_employee_id");
        builder.Property(x => x.VerificationNotes).HasColumnName("verification_notes");
        builder.Property(x => x.VerifiedAt).HasColumnName("verified_at");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.Employee).WithMany().HasForeignKey(x => x.EmployeeId).OnDelete(DeleteBehavior.NoAction);
        builder.HasOne(x => x.LeaveRequest).WithMany().HasForeignKey(x => x.LeaveRequestId).OnDelete(DeleteBehavior.NoAction);
        builder.HasOne(x => x.VerifiedByEmployee).WithMany().HasForeignKey(x => x.VerifiedByEmployeeId).OnDelete(DeleteBehavior.NoAction);
    }
}