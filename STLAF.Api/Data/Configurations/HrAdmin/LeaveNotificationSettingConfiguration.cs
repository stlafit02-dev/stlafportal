using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.HRAdmin.Entities;

namespace STLAF.Api.Data.Configurations.HRAdmin;

public class LeaveNotificationSettingConfiguration : IEntityTypeConfiguration<LeaveNotificationSetting>
{
    public void Configure(EntityTypeBuilder<LeaveNotificationSetting> builder)
    {
        builder.ToTable("hr_leave_notification_settings");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.SmtpSenderId).HasColumnName("smtp_sender_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.SmtpSender)
            .WithMany()
            .HasForeignKey(x => x.SmtpSenderId);
    }
}