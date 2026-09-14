using STLAF.Api.Common.Entities;

namespace STLAF.Api.ClientPortal.Entities;

public class VoucherCode : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string PlanGrants { get; set; } = "premium";

    public int? DurationDays { get; set; }

    public DateTime? VoucherExpiresAt { get; set; }

    public bool IsUsed { get; set; } = false;
    public Guid? RedeemedByClientAccountId { get; set; }
    public DateTime? RedeemedAt { get; set; }

    public Guid CreatedByUserId { get; set; }
}
