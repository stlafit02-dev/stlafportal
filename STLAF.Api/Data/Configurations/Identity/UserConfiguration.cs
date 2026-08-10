using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Identity.Entities;

namespace STLAF.Api.Data.Configurations.Identity;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Username).HasColumnName("username");
        builder.HasIndex(x => x.Username).IsUnique();
        builder.Property(x => x.Email).HasColumnName("email");
        builder.Property(x => x.PasswordHash).HasColumnName("password_hash").IsRequired();
        builder.Property(x => x.FullName).HasColumnName("full_name").IsRequired();
        builder.Property(x => x.DepartmentId).HasColumnName("department_id");
        builder.Property(x => x.RoleId).HasColumnName("role_id");
        builder.Property(x => x.IsActive).HasColumnName("is_active");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.Email).IsUnique();

        builder.HasOne(x => x.Department)
            .WithMany(d => d.Users)
            .HasForeignKey(x => x.DepartmentId);

        builder.HasOne(x => x.Role)
            .WithMany()
            .HasForeignKey(x => x.RoleId);
        builder.Property(x => x.FailedLoginAttempts).HasColumnName("failed_login_attempts");
        builder.Property(x => x.LockoutEnd).HasColumnName("lockout_end");
    }
}