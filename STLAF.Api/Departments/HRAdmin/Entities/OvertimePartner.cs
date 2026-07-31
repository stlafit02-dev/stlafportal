using STLAF.Api.Common.Entities;

namespace STLAF.Api.Departments.HRAdmin.Entities;

public class OvertimePartner : BaseEntity
{
    public string Department { get; set; } = string.Empty;
    public Guid PartnerEmployeeId { get; set; }
    public Employee PartnerEmployee { get; set; } = null!;
}