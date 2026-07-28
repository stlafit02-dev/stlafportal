using Microsoft.EntityFrameworkCore;
using STLAF.Api.Data;
using STLAF.Api.Departments.IT.DTOs;
using STLAF.Api.Departments.IT.Entities;

namespace STLAF.Api.Departments.IT.Services;

public class AssetService : IAssetService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AssetService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<List<AssetDto>> GetAllAsync()
    {
        return await _db.Assets
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => ToDto(a))
            .ToListAsync();
    }

    public async Task<AssetDto> CreateAsync(CreateAssetDto dto, string createdByName)
    {
        var assetTag = string.IsNullOrWhiteSpace(dto.ManualAssetTag)
            ? await GenerateAssetTagAsync(dto.Type)
            : dto.ManualAssetTag!.Trim();

        var asset = new Asset
        {
            AssetTag = assetTag,
            DeviceName = dto.DeviceName,
            Type = dto.Type,
            Brand = dto.Brand,
            Model = dto.Model,
            Price = dto.Price,
            Status = dto.Status,
            Condition = dto.Condition,
            AssignedTo = dto.Status == "Available" ? null : dto.AssignedTo,
            PreviousUser = dto.Condition == "Old" ? dto.PreviousUser : null,
            SerialNumber = dto.SerialNumber,
            Department = dto.Department,
            HasMouse = dto.HasMouse,
            HasKeyboard = dto.HasKeyboard,
            HasMonitor = dto.HasMonitor,
            MouseSerial = dto.HasMouse ? dto.MouseSerial : null,
            KeyboardSerial = dto.HasKeyboard ? dto.KeyboardSerial : null,
            MonitorSerial = dto.HasMonitor ? dto.MonitorSerial : null,
            Remarks = dto.Remarks,
            CreatedByName = createdByName,
            PurchaseDate = dto.PurchaseDate.HasValue
                ? DateTime.SpecifyKind(dto.PurchaseDate.Value, DateTimeKind.Utc)
                : null,
        };

        asset.Qr = BuildQrUrl(asset.AssetTag);

        _db.Assets.Add(asset);
        await _db.SaveChangesAsync();

        return ToDto(asset);
    }

    public async Task<AssetDto?> UpdateAsync(Guid id, UpdateAssetDto dto)
    {
        var asset = await _db.Assets.FirstOrDefaultAsync(a => a.Id == id);
        if (asset is null) return null;

        asset.DeviceName = dto.DeviceName;
        asset.Type = dto.Type;
        asset.Brand = dto.Brand;
        asset.Model = dto.Model;
        asset.Price = dto.Price;
        asset.Status = dto.Status;
        asset.Condition = dto.Condition;
        asset.AssignedTo = dto.Status == "Available" ? null : dto.AssignedTo;
        asset.PreviousUser = dto.Condition == "Old" ? dto.PreviousUser : null;
        asset.SerialNumber = dto.SerialNumber;
        asset.Department = dto.Department;
        asset.HasMouse = dto.HasMouse;
        asset.HasKeyboard = dto.HasKeyboard;
        asset.HasMonitor = dto.HasMonitor;
        asset.MouseSerial = dto.HasMouse ? dto.MouseSerial : null;
        asset.KeyboardSerial = dto.HasKeyboard ? dto.KeyboardSerial : null;
        asset.MonitorSerial = dto.HasMonitor ? dto.MonitorSerial : null;
        asset.Remarks = dto.Remarks;
        asset.PurchaseDate = dto.PurchaseDate.HasValue
            ? DateTime.SpecifyKind(dto.PurchaseDate.Value, DateTimeKind.Utc)
            : null;
        asset.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return ToDto(asset);
    }

    public async Task<PublicAssetDto?> GetPublicByTagAsync(string assetTag)
    {
        var asset = await _db.Assets.FirstOrDefaultAsync(a => a.AssetTag == assetTag);
        if (asset is null) return null;

        var history = await _db.AssetHistories
            .Where(h => h.AssetId == asset.Id)
            .OrderByDescending(h => h.DateOfReplacement)
            .Select(h => new PublicAssetHistoryDto
            {
                PartComponent = h.PartComponent,
                DateOfReplacement = h.DateOfReplacement,
                Notes = h.Notes
            })
            .ToListAsync();

        return new PublicAssetDto
        {
            AssetTag = asset.AssetTag,
            DeviceName = asset.DeviceName,
            Type = asset.Type,
            Brand = asset.Brand,
            Model = asset.Model,
            SerialNumber = asset.SerialNumber,
            Status = asset.Status,
            Condition = asset.Condition,
            AssignedTo = asset.AssignedTo,
            Department = asset.Department,
            HasMouse = asset.HasMouse,
            HasKeyboard = asset.HasKeyboard,
            HasMonitor = asset.HasMonitor,
            MouseSerial = asset.MouseSerial,
            KeyboardSerial = asset.KeyboardSerial,
            MonitorSerial = asset.MonitorSerial,
            History = history
        };
    }

    private async Task<string> GenerateAssetTagAsync(string type)
    {
        var prefix = type switch
        {
            "Laptop" => "LP",
            "Desktop" => "DP",
            "Mobile Phone" => "CP",
            "Printer" => "PRINTER",
            _ => "GEN"
        };

        var year = DateTime.UtcNow.Year;
        var countThisYearAndType = await _db.Assets
            .CountAsync(a => a.Type == type && a.CreatedAt.Year == year);

        var number = countThisYearAndType + 1;
        return $"STLAF-{prefix}-{year}-{number:D3}";
    }

    private string BuildQrUrl(string assetTag)
    {
        var baseUrl = _config["App:FrontendBaseUrl"]?.TrimEnd('/') ?? "http://localhost:5173";
        return $"{baseUrl}/assets/{assetTag}";
    }

    private static AssetDto ToDto(Asset a) => new()
    {
        Id = a.Id,
        AssetTag = a.AssetTag,
        DeviceName = a.DeviceName,
        Type = a.Type,
        Brand = a.Brand,
        Model = a.Model,
        Price = a.Price,
        Status = a.Status,
        Condition = a.Condition,
        AssignedTo = a.AssignedTo,
        PreviousUser = a.PreviousUser,
        SerialNumber = a.SerialNumber,
        Department = a.Department,
        HasMouse = a.HasMouse,
        HasKeyboard = a.HasKeyboard,
        HasMonitor = a.HasMonitor,
        MouseSerial = a.MouseSerial,
        KeyboardSerial = a.KeyboardSerial,
        MonitorSerial = a.MonitorSerial,
        Remarks = a.Remarks,
        CreatedByName = a.CreatedByName,
        PurchaseDate = a.PurchaseDate,
        Qr = a.Qr,
        CreatedAt = a.CreatedAt,
        UpdatedAt = a.UpdatedAt
    };
    public async Task<bool> DeleteAsync(Guid id)
    {
        var asset = await _db.Assets.FirstOrDefaultAsync(a => a.Id == id);
        if (asset is null) return false;

        _db.Assets.Remove(asset);
        await _db.SaveChangesAsync();
        return true;
    }
    public async Task<List<AssetHistoryDto>> GetHistoryAsync(Guid assetId)
    {
        return await _db.AssetHistories
            .Where(h => h.AssetId == assetId)
            .OrderByDescending(h => h.DateOfReplacement)
            .Select(h => ToHistoryDto(h))
            .ToListAsync();
    }

    public async Task<AssetHistoryDto> CreateHistoryAsync(CreateAssetHistoryDto dto)
    {
        var entry = new AssetHistory
        {
            AssetId = dto.AssetId,
            PartComponent = dto.PartComponent,
            SerialNumber = dto.SerialNumber,
            DatePurchased = dto.DatePurchased.HasValue
                ? DateTime.SpecifyKind(dto.DatePurchased.Value, DateTimeKind.Utc)
                : null,
            DateOfReplacement = DateTime.SpecifyKind(dto.DateOfReplacement, DateTimeKind.Utc),
            Notes = dto.Notes,
        };

        _db.AssetHistories.Add(entry);
        await _db.SaveChangesAsync();

        return ToHistoryDto(entry);
    }

    private static AssetHistoryDto ToHistoryDto(AssetHistory h) => new()
    {
        Id = h.Id,
        AssetId = h.AssetId,
        PartComponent = h.PartComponent,
        SerialNumber = h.SerialNumber,
        DatePurchased = h.DatePurchased,
        DateOfReplacement = h.DateOfReplacement,
        Notes = h.Notes,
        CreatedAt = h.CreatedAt
    };
}