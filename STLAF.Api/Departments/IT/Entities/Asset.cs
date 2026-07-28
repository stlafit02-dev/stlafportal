using STLAF.Api.Common.Entities;

namespace STLAF.Api.Departments.IT.Entities;

public class Asset : BaseEntity
{
    public string AssetTag { get; set; } = string.Empty; // e.g. STLAF-LP-2026-001
    public string DeviceName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Laptop, Desktop, Mobile Phone, Printer
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Status { get; set; } = "Available"; // Available, Assigned, Under Repair
    public string Condition { get; set; } = string.Empty; // Brand New, Refurbished, Old
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
    public string Qr { get; set; } = string.Empty; // canonical string encoded into the QR image
}