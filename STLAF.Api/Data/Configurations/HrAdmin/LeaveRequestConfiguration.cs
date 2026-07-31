using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.HRAdmin.Entities;

namespace STLAF.Api.Data.Configurations.HRAdmin;

public class LeaveRequestConfiguration : IEntityTypeConfiguration<LeaveRequest>
{
    public void Configure(EntityTypeBuilder<LeaveRequest> builder)
    {
        builder.ToTable("hr_leave_requests");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.LeaveTypeId).HasColumnName("leave_type_id");
        builder.Property(x => x.StartDate).HasColumnName("start_date");
        builder.Property(x => x.EndDate).HasColumnName("end_date");
        builder.Property(x => x.Days).HasColumnName("days");
        builder.Property(x => x.Reason).HasColumnName("reason");
        builder.Property(x => x.Status).HasColumnName("status");
        builder.Property(x => x.DecidedByEmployeeId).HasColumnName("decided_by_employee_id");
        builder.Property(x => x.DecisionNotes).HasColumnName("decision_notes");
        builder.Property(x => x.DecidedAt).HasColumnName("decided_at");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.EmployeeId);

        builder.HasOne(x => x.LeaveType)
            .WithMany()
            .HasForeignKey(x => x.LeaveTypeId);

        builder.HasOne(x => x.DecidedByEmployee)
            .WithMany()
            .HasForeignKey(x => x.DecidedByEmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
        builder.Property(x => x.RetractionReason).HasColumnName("retraction_reason");
        builder.Property(x => x.RetractionRequestedAt).HasColumnName("retraction_requested_at");
        builder.Property(x => x.RetractionDecidedByEmployeeId).HasColumnName("retraction_decided_by_employee_id");
        builder.Property(x => x.RetractionDecisionNotes).HasColumnName("retraction_decision_notes");
        builder.Property(x => x.RetractionDecidedAt).HasColumnName("retraction_decided_at");

        builder.HasOne(x => x.RetractionDecidedByEmployee)
            .WithMany()
            .HasForeignKey(x => x.RetractionDecidedByEmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}