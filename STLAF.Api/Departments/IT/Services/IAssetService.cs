using STLAF.Api.Departments.IT.DTOs;

namespace STLAF.Api.Departments.IT.Services;

public interface IAssetService
{
    Task<List<AssetDto>> GetAllAsync();
    Task<AssetDto> CreateAsync(CreateAssetDto dto, string createdByName);
    Task<AssetDto?> UpdateAsync(Guid id, UpdateAssetDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<PublicAssetDto?> GetPublicByTagAsync(string assetTag);
    Task<List<AssetHistoryDto>> GetHistoryAsync(Guid assetId);
    Task<AssetHistoryDto> CreateHistoryAsync(CreateAssetHistoryDto dto);
}