using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.HRAdmin.Entities;

namespace STLAF.Api.Data.Configurations.HRAdmin;

public class LeaveApproverConfiguration : IEntityTypeConfiguration<LeaveApprover>
{
    public void Configure(EntityTypeBuilder<LeaveApprover> builder)
    {
        builder.ToTable("hr_leave_approvers");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Department).HasColumnName("department").IsRequired();
        builder.Property(x => x.ApproverEmployeeId).HasColumnName("approver_employee_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.Department).IsUnique();

        builder.HasOne(x => x.ApproverEmployee)
            .WithMany()
            .HasForeignKey(x => x.ApproverEmployeeId);
    }
}