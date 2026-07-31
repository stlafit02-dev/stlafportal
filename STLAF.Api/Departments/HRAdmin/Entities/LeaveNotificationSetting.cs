using STLAF.Api.Common.Entities;

namespace STLAF.Api.Departments.HRAdmin.Entities;

public class LeaveNotificationSetting : BaseEntity
{
    public Guid SmtpSenderId { get; set; }
    public SmtpSender SmtpSender { get; set; } = null!;
}