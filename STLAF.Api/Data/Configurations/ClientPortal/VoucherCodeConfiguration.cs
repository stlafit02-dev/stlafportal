using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.ClientPortal.Entities;

namespace STLAF.Api.Data.Configurations.ClientPortal;

public class VoucherCodeConfiguration : IEntityTypeConfiguration<VoucherCode>
{
    public void Configure(EntityTypeBuilder<VoucherCode> builder)
    {
        builder.ToTable("client_portal_voucher_codes");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Code).HasColumnName("code").IsRequired();
        builder.Property(x => x.PlanGrants).HasColumnName("plan_grants").IsRequired();
        builder.Property(x => x.DurationDays).HasColumnName("duration_days");
        builder.Property(x => x.VoucherExpiresAt).HasColumnName("voucher_expires_at");
        builder.Property(x => x.IsUsed).HasColumnName("is_used");
        builder.Property(x => x.RedeemedByClientAccountId).HasColumnName("redeemed_by_client_account_id");
        builder.Property(x => x.RedeemedAt).HasColumnName("redeemed_at");
        builder.Property(x => x.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.Code).IsUnique();
    }
}
