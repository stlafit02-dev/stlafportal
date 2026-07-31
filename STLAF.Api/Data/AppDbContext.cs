using Microsoft.EntityFrameworkCore;
using STLAF.Api.Common.Entities;
using STLAF.Api.Identity.Entities;
using STLAF.Api.Departments.IT.Entities;
using STLAF.Api.Departments.HRAdmin.Entities;


namespace STLAF.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<AssetHistory> AssetHistories => Set<AssetHistory>();
    public DbSet<GwsAccount> GwsAccounts => Set<GwsAccount>();
    public DbSet<EmailAccount> EmailAccounts => Set<EmailAccount>();
    public DbSet<AppPassword> AppPasswords => Set<AppPassword>();
    public DbSet<EmployeeCategory> EmployeeCategories => Set<EmployeeCategory>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<LeaveType> LeaveTypes => Set<LeaveType>();
    public DbSet<LeaveApprover> LeaveApprovers => Set<LeaveApprover>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<LeaveNotificationSetting> LeaveNotificationSettings => Set<LeaveNotificationSetting>();
    public DbSet<SmtpSender> SmtpSenders => Set<SmtpSender>();
    public DbSet<EmployeeLeaveCredit> EmployeeLeaveCredits => Set<EmployeeLeaveCredit>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}