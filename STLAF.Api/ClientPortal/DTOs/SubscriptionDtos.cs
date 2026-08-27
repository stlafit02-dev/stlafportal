namespace STLAF.Api.ClientPortal.DTOs;

public class SubscriptionDto
{
    public string Plan { get; set; } = "free";
    public string Status { get; set; } = "active";
    public DateTime? ExpiresAt { get; set; }
}
