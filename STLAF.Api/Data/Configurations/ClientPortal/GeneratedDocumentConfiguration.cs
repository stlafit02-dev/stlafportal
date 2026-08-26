using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.ClientPortal.Entities;

namespace STLAF.Api.Data.Configurations.ClientPortal;

public class GeneratedDocumentConfiguration : IEntityTypeConfiguration<GeneratedDocument>
{
    public void Configure(EntityTypeBuilder<GeneratedDocument> builder)
    {
        builder.ToTable("client_portal_generated_documents");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.SubmissionId).HasColumnName("submission_id");
        builder.Property(x => x.FileKey).HasColumnName("file_key").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.SubmissionId);

        builder.HasOne(x => x.Submission)
            .WithMany()
            .HasForeignKey(x => x.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
