using Microsoft.EntityFrameworkCore;
using STLAF.Api.Common.Entities;
using STLAF.Api.Identity.Entities;
using STLAF.Api.Departments.IT.Entities;
using STLAF.Api.Departments.HRAdmin.Entities;
using STLAF.Api.ClientPortal.Entities;


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
    public DbSet<OvertimePartner> OvertimePartners => Set<OvertimePartner>();
    public DbSet<OvertimeRequest> OvertimeRequests => Set<OvertimeRequest>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
    public DbSet<UndertimeRequest> UndertimeRequests => Set<UndertimeRequest>();
    public DbSet<MedicalCertificate> MedicalCertificates => Set<MedicalCertificate>();
    public DbSet<ModuleAccessPosition> ModuleAccessPositions => Set<ModuleAccessPosition>();
    public DbSet<DocumentRequest> DocumentRequests => Set<DocumentRequest>();
    public DbSet<IntakeGroup> IntakeGroups => Set<IntakeGroup>();
    public DbSet<IntakeService> IntakeServices => Set<IntakeService>();
    public DbSet<IntakeSubmission> IntakeSubmissions => Set<IntakeSubmission>();
    public DbSet<IntakeSubmissionService> IntakeSubmissionServices => Set<IntakeSubmissionService>();
    public DbSet<IntakeFullAccessGrant> IntakeFullAccessGrants => Set<IntakeFullAccessGrant>();

    public DbSet<ClientAccount> ClientAccounts => Set<ClientAccount>();
    public DbSet<Service> ClientPortalServices => Set<Service>();
    public DbSet<FormSchema> ClientPortalFormSchemas => Set<FormSchema>();
    public DbSet<DocumentTemplate> ClientPortalDocumentTemplates => Set<DocumentTemplate>();
    public DbSet<Submission> ClientPortalSubmissions => Set<Submission>();
    public DbSet<GeneratedDocument> ClientPortalGeneratedDocuments => Set<GeneratedDocument>();
    public DbSet<Subscription> ClientPortalSubscriptions => Set<Subscription>();
    public DbSet<VoucherCode> ClientPortalVoucherCodes => Set<VoucherCode>();
    public DbSet<ClientPortalAdminGrant> ClientPortalAdminGrants => Set<ClientPortalAdminGrant>();

}