using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.HRAdmin.Entities;

namespace STLAF.Api.Data.Configurations.HRAdmin;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("hr_employees");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.CategoryId).HasColumnName("category_id");
        builder.Property(x => x.FirstName).HasColumnName("firstname").IsRequired();
        builder.Property(x => x.MiddleName).HasColumnName("middlename");
        builder.Property(x => x.LastName).HasColumnName("lastname").IsRequired();
        builder.Property(x => x.MobileNumber).HasColumnName("mobile_number");
        builder.Property(x => x.Age).HasColumnName("age");
        builder.Property(x => x.Sex).HasColumnName("sex");
        builder.Property(x => x.Bday).HasColumnName("bday");
        builder.Property(x => x.Nationality).HasColumnName("nationality");
        builder.Property(x => x.Department).HasColumnName("department");
        builder.Property(x => x.OfficePosition).HasColumnName("officeposition");
        builder.Property(x => x.PersonalEmail).HasColumnName("personalemail");
        builder.Property(x => x.CompanyEmail).HasColumnName("companyemail");
        builder.Property(x => x.StartDate).HasColumnName("startdate");
        builder.Property(x => x.Status).HasColumnName("status");
        builder.Property(x => x.UserId).HasColumnName("user_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.CompanyId).IsUnique();

        builder.HasOne(x => x.Category)
            .WithMany()
            .HasForeignKey(x => x.CategoryId);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId);
    }
}