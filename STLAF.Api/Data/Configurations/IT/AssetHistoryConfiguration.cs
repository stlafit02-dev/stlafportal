using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.IT.Entities;

namespace STLAF.Api.Data.Configurations.IT;

public class AssetHistoryConfiguration : IEntityTypeConfiguration<AssetHistory>
{
    public void Configure(EntityTypeBuilder<AssetHistory> builder)
    {
        builder.ToTable("it_asset_history");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.AssetId).HasColumnName("asset_id");
        builder.Property(x => x.PartComponent).HasColumnName("part_component").IsRequired();
        builder.Property(x => x.SerialNumber).HasColumnName("serial_number");
        builder.Property(x => x.DatePurchased).HasColumnName("date_purchased");
        builder.Property(x => x.DateOfReplacement).HasColumnName("date_of_replacement");
        builder.Property(x => x.Notes).HasColumnName("notes");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.Asset)
            .WithMany()
            .HasForeignKey(x => x.AssetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}