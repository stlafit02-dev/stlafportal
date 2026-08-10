using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.HRAdmin.Entities;

namespace STLAF.Api.Data.Configurations.HRAdmin;

public class EmployeeLeaveCreditConfiguration : IEntityTypeConfiguration<EmployeeLeaveCredit>
{
    public void Configure(EntityTypeBuilder<EmployeeLeaveCredit> builder)
    {
        builder.ToTable("hr_employee_leave_credits");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.LeaveTypeId).HasColumnName("leave_type_id");
        builder.Property(x => x.Credits).HasColumnName("credits");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => new { x.EmployeeId, x.LeaveTypeId }).IsUnique();

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.LeaveType)
            .WithMany()
            .HasForeignKey(x => x.LeaveTypeId);
    }
}