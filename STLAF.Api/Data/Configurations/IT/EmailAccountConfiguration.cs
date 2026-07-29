using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.IT.Entities;

namespace STLAF.Api.Data.Configurations.IT;

public class EmailAccountConfiguration : IEntityTypeConfiguration<EmailAccount>
{
    public void Configure(EntityTypeBuilder<EmailAccount> builder)
    {
        builder.ToTable("it_email_accounts");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.FullName).HasColumnName("full_name").IsRequired();
        builder.Property(x => x.LocalGmail).HasColumnName("local_gmail").IsRequired();
        builder.Property(x => x.Password).HasColumnName("password").IsRequired();
        builder.Property(x => x.StlafEmail).HasColumnName("stlaf_email").IsRequired();
        builder.Property(x => x.OldUser).HasColumnName("old_user");
        builder.Property(x => x.Status).HasColumnName("status");
        builder.Property(x => x.GwsAccountId).HasColumnName("gws_account_id");
        builder.Property(x => x.Remarks).HasColumnName("remarks");
        builder.Property(x => x.Deleted).HasColumnName("deleted");
        builder.Property(x => x.DeleteAt).HasColumnName("delete_at");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");
        builder.Property(x => x.OldStlafEmail).HasColumnName("old_stlaf_email");
        builder.Property(x => x.Recycled).HasColumnName("recycled");
        builder.Property(x => x.RecycledAt).HasColumnName("recycled_at");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.GwsAccount)
            .WithMany()
            .HasForeignKey(x => x.GwsAccountId);
    }
}