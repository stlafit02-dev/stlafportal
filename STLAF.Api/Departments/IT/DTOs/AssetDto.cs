namespace STLAF.Api.Departments.IT.DTOs;

public class AssetDto
{
    public Guid Id { get; set; }
    public string AssetTag { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public string? PreviousUser { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string? Department { get; set; }
    public bool HasMouse { get; set; }
    public bool HasKeyboard { get; set; }
    public bool HasMonitor { get; set; }
    public string? MouseSerial { get; set; }
    public string? KeyboardSerial { get; set; }
    public string? MonitorSerial { get; set; }
    public string? Remarks { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime? PurchaseDate { get; set; }
    public string Qr { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateAssetDto
{
    public string DeviceName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Status { get; set; } = "Available";
    public string Condition { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public string? PreviousUser { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string? Department { get; set; }
    public bool HasMouse { get; set; }
    public bool HasKeyboard { get; set; }
    public bool HasMonitor { get; set; }
    public string? MouseSerial { get; set; }
    public string? KeyboardSerial { get; set; }
    public string? MonitorSerial { get; set; }
    public string? Remarks { get; set; }
    public DateTime? PurchaseDate { get; set; }

    // When the person checks "already has an Asset ID", this carries the existing tag.
    // Null/empty means: auto-generate one.
    public string? ManualAssetTag { get; set; }
}

public class UpdateAssetDto
{
    public string DeviceName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public string? PreviousUser { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string? Department { get; set; }
    public bool HasMouse { get; set; }
    public bool HasKeyboard { get; set; }
    public bool HasMonitor { get; set; }
    public string? MouseSerial { get; set; }
    public string? KeyboardSerial { get; set; }
    public string? MonitorSerial { get; set; }
    public string? Remarks { get; set; }
    public DateTime? PurchaseDate { get; set; }
}

public class PublicAssetDto
{
    public string AssetTag { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public string? Department { get; set; }
    public bool HasMouse { get; set; }
    public bool HasKeyboard { get; set; }
    public bool HasMonitor { get; set; }
    public string? MouseSerial { get; set; }
    public string? KeyboardSerial { get; set; }
    public string? MonitorSerial { get; set; }
     public List<PublicAssetHistoryDto> History { get; set; } = new();
}

public class AssetHistoryDto
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public string PartComponent { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public DateTime? DatePurchased { get; set; }
    public DateTime DateOfReplacement { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAssetHistoryDto
{
    public Guid AssetId { get; set; }
    public string PartComponent { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public DateTime? DatePurchased { get; set; }
    public DateTime DateOfReplacement { get; set; }
    public string? Notes { get; set; }
}
public class PublicAssetHistoryDto
{
    public string PartComponent { get; set; } = string.Empty;
    public DateTime DateOfReplacement { get; set; }
    public string? Notes { get; set; }
}