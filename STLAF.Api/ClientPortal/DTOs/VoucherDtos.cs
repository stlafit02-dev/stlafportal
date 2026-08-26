namespace STLAF.Api.ClientPortal.DTOs;

public class RedeemVoucherDto
{
    public string Code { get; set; } = string.Empty;
}

public class RedeemVoucherResultDto
{
    public string Plan { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
}

public class GenerateVoucherDto
{
    public int? DurationDays { get; set; }
    public DateTime? VoucherExpiresAt { get; set; }
}

public class VoucherCodeDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public int? DurationDays { get; set; }
    public DateTime? VoucherExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime? RedeemedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
