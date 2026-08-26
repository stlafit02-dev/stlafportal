using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.ClientPortal.Entities;

namespace STLAF.Api.Data.Configurations.ClientPortal;

public class DocumentTemplateConfiguration : IEntityTypeConfiguration<DocumentTemplate>
{
    public void Configure(EntityTypeBuilder<DocumentTemplate> builder)
    {
        builder.ToTable("client_portal_document_templates");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.ServiceId).HasColumnName("service_id");
        builder.Property(x => x.TemplateFileKey).HasColumnName("template_file_key").IsRequired();
        builder.Property(x => x.FieldConfigJson).HasColumnName("field_config_json").HasColumnType("jsonb").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.ServiceId);

        builder.HasOne(x => x.Service)
            .WithMany()
            .HasForeignKey(x => x.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
