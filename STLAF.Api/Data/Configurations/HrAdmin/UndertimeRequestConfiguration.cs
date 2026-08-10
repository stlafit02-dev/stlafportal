using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.HRAdmin.Entities;

namespace STLAF.Api.Data.Configurations.HRAdmin;

public class UndertimeRequestConfiguration : IEntityTypeConfiguration<UndertimeRequest>
{
    public void Configure(EntityTypeBuilder<UndertimeRequest> builder)
    {
        builder.ToTable("hr_undertime_requests");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.Date).HasColumnName("date");
        builder.Property(x => x.StartTime).HasColumnName("start_time");
        builder.Property(x => x.EndTime).HasColumnName("end_time");
        builder.Property(x => x.Hours).HasColumnName("hours");
        builder.Property(x => x.Reason).HasColumnName("reason");
        builder.Property(x => x.Status).HasColumnName("status");
        builder.Property(x => x.DecidedByEmployeeId).HasColumnName("decided_by_employee_id");
        builder.Property(x => x.DecisionNotes).HasColumnName("decision_notes");
        builder.Property(x => x.DecidedAt).HasColumnName("decided_at");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.Employee).WithMany().HasForeignKey(x => x.EmployeeId).OnDelete(DeleteBehavior.NoAction);
        builder.HasOne(x => x.DecidedByEmployee).WithMany().HasForeignKey(x => x.DecidedByEmployeeId).OnDelete(DeleteBehavior.NoAction);
    }
}