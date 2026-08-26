using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.ClientPortal.Entities;

namespace STLAF.Api.Data.Configurations.ClientPortal;

public class ClientPortalAdminGrantConfiguration : IEntityTypeConfiguration<ClientPortalAdminGrant>
{
    public void Configure(EntityTypeBuilder<ClientPortalAdminGrant> builder)
    {
        builder.ToTable("client_portal_admin_grants");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.UserId).HasColumnName("user_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.UserId).IsUnique();
    }
}
