using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.ClientPortal.Entities;

namespace STLAF.Api.Data.Configurations.ClientPortal;

public class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> builder)
    {
        builder.ToTable("client_portal_services");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Name).HasColumnName("name").IsRequired();
        builder.Property(x => x.Description).HasColumnName("description");
        builder.Property(x => x.Category).HasColumnName("category");
        builder.Property(x => x.IsActive).HasColumnName("is_active");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
    }
}
