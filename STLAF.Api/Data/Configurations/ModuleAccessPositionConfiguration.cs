using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Common.Entities;

namespace STLAF.Api.Data.Configurations;

public class ModuleAccessPositionConfiguration : IEntityTypeConfiguration<ModuleAccessPosition>
{
    public void Configure(EntityTypeBuilder<ModuleAccessPosition> builder)
    {
        builder.ToTable("module_access_positions");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Module).HasColumnName("module").IsRequired();
        builder.Property(x => x.OfficePosition).HasColumnName("office_position").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => new { x.Module, x.OfficePosition }).IsUnique();
    }
}