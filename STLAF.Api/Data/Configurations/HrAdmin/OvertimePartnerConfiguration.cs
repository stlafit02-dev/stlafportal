using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.HRAdmin.Entities;

namespace STLAF.Api.Data.Configurations.HRAdmin;

public class OvertimePartnerConfiguration : IEntityTypeConfiguration<OvertimePartner>
{
    public void Configure(EntityTypeBuilder<OvertimePartner> builder)
    {
        builder.ToTable("hr_overtime_partners");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Department).HasColumnName("department").IsRequired();
        builder.Property(x => x.PartnerEmployeeId).HasColumnName("partner_employee_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.Department).IsUnique();

        builder.HasOne(x => x.PartnerEmployee)
            .WithMany()
            .HasForeignKey(x => x.PartnerEmployeeId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}