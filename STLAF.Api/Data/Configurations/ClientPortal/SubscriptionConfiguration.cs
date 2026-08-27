using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.ClientPortal.Entities;

namespace STLAF.Api.Data.Configurations.ClientPortal;

public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("client_portal_subscriptions");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.ClientAccountId).HasColumnName("client_account_id");
        builder.Property(x => x.Plan).HasColumnName("plan").IsRequired();
        builder.Property(x => x.Status).HasColumnName("status").IsRequired();
        builder.Property(x => x.ActivatedAt).HasColumnName("activated_at");
        builder.Property(x => x.ExpiresAt).HasColumnName("expires_at");
        builder.Property(x => x.VoucherCodeId).HasColumnName("voucher_code_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.ClientAccountId).IsUnique();

        builder.HasOne(x => x.ClientAccount)
            .WithMany()
            .HasForeignKey(x => x.ClientAccountId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.VoucherCode)
            .WithMany()
            .HasForeignKey(x => x.VoucherCodeId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
