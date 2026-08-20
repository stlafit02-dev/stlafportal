using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Common.Entities;

namespace STLAF.Api.Data.Configurations;

public class IntakeSubmissionServiceConfiguration : IEntityTypeConfiguration<IntakeSubmissionService>
{
    public void Configure(EntityTypeBuilder<IntakeSubmissionService> builder)
    {
        builder.ToTable("intake_submission_services");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.SubmissionId).HasColumnName("submission_id");
        builder.Property(x => x.ServiceId).HasColumnName("service_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.Submission)
            .WithMany(s => s.SelectedServices)
            .HasForeignKey(x => x.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Service)
            .WithMany()
            .HasForeignKey(x => x.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}