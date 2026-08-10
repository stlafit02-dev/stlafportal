using Microsoft.EntityFrameworkCore;
using STLAF.Api.Identity.Entities;
using STLAF.Api.Departments.HRAdmin.Entities;
using STLAF.Api.Common.Entities;

namespace STLAF.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // Stage 1: Departments
        if (!await db.Departments.AnyAsync())
        {
            db.Departments.AddRange(
                new Department { Name = "IT" },
                new Department { Name = "HRAdmin" },
                new Department { Name = "Litigation" },
                new Department { Name = "Accounting" },
                new Department { Name = "Corporate" },
                new Department { Name = "Marketing" },
                new Department { Name = "Partner" }
            );
            await db.SaveChangesAsync();
        }

        // Stage 2: Roles
        if (!await db.Roles.AnyAsync())
        {
            db.Roles.AddRange(
                new Role { Name = "SuperAdmin" },
                new Role { Name = "DeptAdmin" },
                new Role { Name = "Employee" }
            );
            await db.SaveChangesAsync();
        }

        // Stage 3: Test users (depends on Departments + Roles already existing in DB)
        if (!await db.Users.AnyAsync())
        {
            var departments = await db.Departments.ToListAsync();
            var deptAdminRole = await db.Roles.FirstAsync(r => r.Name == "DeptAdmin");

            foreach (var dept in departments)
            {
                db.Users.Add(new User
                {
                    Email = $"{dept.Name.ToLower()}@stlaf.global",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    FullName = $"{dept.Name} Test User",
                    DepartmentId = dept.Id,
                    RoleId = deptAdminRole.Id,
                    IsActive = true
                });
            }

            await db.SaveChangesAsync();
        }
        if (!await db.EmployeeCategories.AnyAsync())
        {
            db.EmployeeCategories.AddRange(
                new EmployeeCategory { Name = "STLAF", Code = 1 },
                new EmployeeCategory { Name = "CCT", Code = 2 }
            );
            await db.SaveChangesAsync();
        }
        if (!await db.LeaveTypes.AnyAsync())
        {
            db.LeaveTypes.AddRange(
                new LeaveType { Name = "Vacation Leave", DefaultCredits = 15 },
                new LeaveType { Name = "Sick Leave", DefaultCredits = 15 },
                new LeaveType { Name = "Emergency Leave", DefaultCredits = 5 }
            );
            await db.SaveChangesAsync();
        }
    }
}