using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Common.Entities;

namespace STLAF.Api.Data.Configurations;

public class IntakeGroupConfiguration : IEntityTypeConfiguration<IntakeGroup>
{
    public void Configure(EntityTypeBuilder<IntakeGroup> builder)
    {
        builder.ToTable("intake_groups");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Category).HasColumnName("category").IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").IsRequired();
        builder.Property(x => x.RecipientEmails).HasColumnName("recipient_emails").IsRequired();
        builder.Property(x => x.SortOrder).HasColumnName("sort_order");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
    }
}