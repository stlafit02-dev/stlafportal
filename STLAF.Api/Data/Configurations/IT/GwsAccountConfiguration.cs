using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.IT.Entities;

namespace STLAF.Api.Data.Configurations.IT;

public class GwsAccountConfiguration : IEntityTypeConfiguration<GwsAccount>
{
    public void Configure(EntityTypeBuilder<GwsAccount> builder)
    {
        builder.ToTable("gws_accounts");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Name).HasColumnName("name").IsRequired();
        builder.Property(x => x.MaxCapacity).HasColumnName("max_capacity");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
    }
}