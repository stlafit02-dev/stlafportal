using Microsoft.EntityFrameworkCore;
using STLAF.Api.ClientPortal.DTOs;
using ServiceEntity = STLAF.Api.ClientPortal.Entities.Service;
using STLAF.Api.Data;

namespace STLAF.Api.ClientPortal.Services;

public class ServiceCatalogService : IServiceCatalogService
{
    private readonly AppDbContext _db;

    public ServiceCatalogService(AppDbContext db)
    {
        _db = db;
    }

    private static ServiceDto Map(ServiceEntity s) => new()
    {
        Id = s.Id,
        Name = s.Name,
        Description = s.Description,
        Category = s.Category,
        IsActive = s.IsActive,
        CreatedAt = s.CreatedAt
    };

    public async Task<List<ServiceDto>> GetActiveAsync()
    {
        var services = await _db.ClientPortalServices
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .ToListAsync();
        return services.Select(Map).ToList();
    }

    public async Task<List<ServiceDto>> GetAllAsync()
    {
        var services = await _db.ClientPortalServices
            .OrderBy(s => s.Name)
            .ToListAsync();
        return services.Select(Map).ToList();
    }

    public async Task<ServiceDto?> GetByIdAsync(Guid id)
    {
        var service = await _db.ClientPortalServices.FirstOrDefaultAsync(s => s.Id == id);
        return service is null ? null : Map(service);
    }

    public async Task<ServiceDto> SaveAsync(Guid? id, SaveServiceDto dto)
    {
        ServiceEntity service;
        if (id is null)
        {
            service = new ServiceEntity();
            _db.ClientPortalServices.Add(service);
        }
        else
        {
            service = await _db.ClientPortalServices.FirstAsync(s => s.Id == id);
        }

        service.Name = dto.Name.Trim();
        service.Description = dto.Description;
        service.Category = dto.Category;
        service.IsActive = dto.IsActive;
        service.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Map(service);
    }
}
