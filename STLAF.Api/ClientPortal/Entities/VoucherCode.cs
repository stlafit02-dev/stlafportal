using STLAF.Api.Common.Entities;

namespace STLAF.Api.ClientPortal.Entities;

public class VoucherCode : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string PlanGrants { get; set; } = "premium";

    // Length of the premium grant after redemption; null = never expires once redeemed.
    public int? DurationDays { get; set; }

    // Deadline to redeem the code itself; null = no deadline.
    public DateTime? VoucherExpiresAt { get; set; }

    public bool IsUsed { get; set; } = false;
    public Guid? RedeemedByClientAccountId { get; set; }
    public DateTime? RedeemedAt { get; set; }

    // Staff User.Id who issued it.
    public Guid CreatedByUserId { get; set; }
}
