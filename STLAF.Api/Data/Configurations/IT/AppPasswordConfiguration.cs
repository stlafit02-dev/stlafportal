using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.IT.Entities;

namespace STLAF.Api.Data.Configurations.IT;

public class AppPasswordConfiguration : IEntityTypeConfiguration<AppPassword>
{
    public void Configure(EntityTypeBuilder<AppPassword> builder)
    {
        builder.ToTable("it_app_passwords");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.GwsAccountId).HasColumnName("gws_account_id");
        builder.Property(x => x.AppPasswordValue).HasColumnName("app_password").IsRequired();
        builder.Property(x => x.Month).HasColumnName("month");
        builder.Property(x => x.Year).HasColumnName("year");
        builder.Property(x => x.Notes).HasColumnName("notes");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.GwsAccount)
            .WithMany()
            .HasForeignKey(x => x.GwsAccountId);
    }
}