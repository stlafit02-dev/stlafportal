using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.ClientPortal.Entities;

namespace STLAF.Api.Data.Configurations.ClientPortal;

public class SubmissionConfiguration : IEntityTypeConfiguration<Submission>
{
    public void Configure(EntityTypeBuilder<Submission> builder)
    {
        builder.ToTable("client_portal_submissions");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.ClientAccountId).HasColumnName("client_account_id");
        builder.Property(x => x.ServiceId).HasColumnName("service_id");
        builder.Property(x => x.FormSchemaVersion).HasColumnName("form_schema_version");
        builder.Property(x => x.ResponsesJson).HasColumnName("responses_json").HasColumnType("jsonb").IsRequired();
        builder.Property(x => x.Status).HasColumnName("status").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.ClientAccountId);
        builder.HasIndex(x => x.ServiceId);

        builder.HasOne(x => x.ClientAccount)
            .WithMany()
            .HasForeignKey(x => x.ClientAccountId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Service)
            .WithMany()
            .HasForeignKey(x => x.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
