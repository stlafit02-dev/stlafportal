using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Common.Entities;

namespace STLAF.Api.Data.Configurations;

public class IntakeServiceConfiguration : IEntityTypeConfiguration<IntakeService>
{
    public void Configure(EntityTypeBuilder<IntakeService> builder)
    {
        builder.ToTable("intake_services");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.GroupId).HasColumnName("group_id");
        builder.Property(x => x.Name).HasColumnName("name").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.Group)
            .WithMany()
            .HasForeignKey(x => x.GroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}