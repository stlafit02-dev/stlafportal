using STLAF.Api.ClientPortal.DTOs;

namespace STLAF.Api.ClientPortal.Services;

public interface IServiceCatalogService
{
    Task<List<ServiceDto>> GetActiveAsync();
    Task<List<ServiceDto>> GetAllAsync();
    Task<ServiceDto?> GetByIdAsync(Guid id);
    Task<ServiceDto> SaveAsync(Guid? id, SaveServiceDto dto);
    Task<DeleteServiceOutcome> DeleteAsync(Guid id);
}
