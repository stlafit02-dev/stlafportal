using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Common.Entities;

namespace STLAF.Api.Data.Configurations;

public class IntakeFullAccessGrantConfiguration : IEntityTypeConfiguration<IntakeFullAccessGrant>
{
    public void Configure(EntityTypeBuilder<IntakeFullAccessGrant> builder)
    {
        builder.ToTable("intake_full_access_grants");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.CompanyId).IsUnique();
    }
}