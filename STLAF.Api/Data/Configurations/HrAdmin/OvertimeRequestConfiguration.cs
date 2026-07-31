using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.HRAdmin.Entities;

namespace STLAF.Api.Data.Configurations.HRAdmin;

public class OvertimeRequestConfiguration : IEntityTypeConfiguration<OvertimeRequest>
{
    public void Configure(EntityTypeBuilder<OvertimeRequest> builder)
    {
        builder.ToTable("hr_overtime_requests");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.Date).HasColumnName("date");
        builder.Property(x => x.StartTime).HasColumnName("start_time");
        builder.Property(x => x.EndTime).HasColumnName("end_time");
        builder.Property(x => x.Hours).HasColumnName("hours");
        builder.Property(x => x.Reason).HasColumnName("reason");
        builder.Property(x => x.Status).HasColumnName("status");
        builder.Property(x => x.DeptDecidedByEmployeeId).HasColumnName("dept_decided_by_employee_id");
        builder.Property(x => x.DeptDecisionNotes).HasColumnName("dept_decision_notes");
        builder.Property(x => x.DeptDecidedAt).HasColumnName("dept_decided_at");
        builder.Property(x => x.PartnerDecidedByEmployeeId).HasColumnName("partner_decided_by_employee_id");
        builder.Property(x => x.PartnerDecisionNotes).HasColumnName("partner_decision_notes");
        builder.Property(x => x.PartnerDecidedAt).HasColumnName("partner_decided_at");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(x => x.DeptDecidedByEmployee)
            .WithMany()
            .HasForeignKey(x => x.DeptDecidedByEmployeeId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(x => x.PartnerDecidedByEmployee)
            .WithMany()
            .HasForeignKey(x => x.PartnerDecidedByEmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}