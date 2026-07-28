using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.IT.Entities;

namespace STLAF.Api.Data.Configurations.IT;

public class AssetConfiguration : IEntityTypeConfiguration<Asset>
{
    public void Configure(EntityTypeBuilder<Asset> builder)
    {
        builder.ToTable("it_assets");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.AssetTag).HasColumnName("asset_tag").IsRequired();
        builder.Property(x => x.DeviceName).HasColumnName("device_name").IsRequired();
        builder.Property(x => x.Type).HasColumnName("type").IsRequired();
        builder.Property(x => x.Brand).HasColumnName("brand");
        builder.Property(x => x.Model).HasColumnName("model");
        builder.Property(x => x.Price).HasColumnName("price").HasColumnType("numeric(12,2)");
        builder.Property(x => x.Status).HasColumnName("status");
        builder.Property(x => x.Condition).HasColumnName("condition");
        builder.Property(x => x.AssignedTo).HasColumnName("assigned_to");
        builder.Property(x => x.PreviousUser).HasColumnName("previous_user");
        builder.Property(x => x.SerialNumber).HasColumnName("serial_number");
        builder.Property(x => x.Department).HasColumnName("department");
        builder.Property(x => x.HasMouse).HasColumnName("has_mouse");
        builder.Property(x => x.HasKeyboard).HasColumnName("has_keyboard");
        builder.Property(x => x.HasMonitor).HasColumnName("has_monitor");
        builder.Property(x => x.MouseSerial).HasColumnName("mouse_serial");
        builder.Property(x => x.KeyboardSerial).HasColumnName("keyboard_serial");
        builder.Property(x => x.MonitorSerial).HasColumnName("monitor_serial");
        builder.Property(x => x.Remarks).HasColumnName("remarks");
        builder.Property(x => x.CreatedByName).HasColumnName("created_by_name");
        builder.Property(x => x.PurchaseDate).HasColumnName("purchase_date");
        builder.Property(x => x.Qr).HasColumnName("qr");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.AssetTag).IsUnique();
    }
}