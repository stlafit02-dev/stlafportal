using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.ClientPortal.Entities;

namespace STLAF.Api.Data.Configurations.ClientPortal;

public class FormSchemaConfiguration : IEntityTypeConfiguration<FormSchema>
{
    public void Configure(EntityTypeBuilder<FormSchema> builder)
    {
        builder.ToTable("client_portal_form_schemas");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.DocumentTemplateId).HasColumnName("document_template_id");
        builder.Property(x => x.Version).HasColumnName("version");
        builder.Property(x => x.FieldsJson).HasColumnName("fields_json").HasColumnType("jsonb").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => new { x.DocumentTemplateId, x.Version }).IsUnique();

        builder.HasOne(x => x.DocumentTemplate)
            .WithMany()
            .HasForeignKey(x => x.DocumentTemplateId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
