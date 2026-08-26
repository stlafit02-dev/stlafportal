using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.ClientPortal.Entities;

namespace STLAF.Api.Data.Configurations.ClientPortal;

public class ClientAccountConfiguration : IEntityTypeConfiguration<ClientAccount>
{
    public void Configure(EntityTypeBuilder<ClientAccount> builder)
    {
        builder.ToTable("client_accounts");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Email).HasColumnName("email").IsRequired();
        builder.Property(x => x.PasswordHash).HasColumnName("password_hash").IsRequired();
        builder.Property(x => x.FullName).HasColumnName("full_name").IsRequired();
        builder.Property(x => x.IsActive).HasColumnName("is_active");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.Email).IsUnique();
    }
}
