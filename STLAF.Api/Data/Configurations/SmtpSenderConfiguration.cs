using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Common.Entities;

namespace STLAF.Api.Data.Configurations;

public class SmtpSenderConfiguration : IEntityTypeConfiguration<SmtpSender>
{
    public void Configure(EntityTypeBuilder<SmtpSender> builder)
    {
        builder.ToTable("smtp_senders");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Label).HasColumnName("label").IsRequired();
        builder.Property(x => x.Email).HasColumnName("email").IsRequired();
        builder.Property(x => x.AppPasswordValue).HasColumnName("app_password").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
    }
}