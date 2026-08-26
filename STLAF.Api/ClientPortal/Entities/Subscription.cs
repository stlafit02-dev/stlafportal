using STLAF.Api.Common.Entities;

namespace STLAF.Api.ClientPortal.Entities;

public class Subscription : BaseEntity
{
    public Guid ClientAccountId { get; set; }
    public ClientAccount ClientAccount { get; set; } = null!;

    // free | premium
    public string Plan { get; set; } = "free";

    // active | expired
    public string Status { get; set; } = "active";

    public DateTime ActivatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }

    public Guid? VoucherCodeId { get; set; }
    public VoucherCode? VoucherCode { get; set; }
}
