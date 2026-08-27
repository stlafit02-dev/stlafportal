using Microsoft.EntityFrameworkCore;
using STLAF.Api.ClientPortal.DTOs;
using ServiceEntity = STLAF.Api.ClientPortal.Entities.Service;
using STLAF.Api.Common.Services;
using STLAF.Api.Data;

namespace STLAF.Api.ClientPortal.Services;

public class ServiceCatalogService : IServiceCatalogService
{
    private readonly AppDbContext _db;
    private readonly IFileStorageService _fileStorage;

    public ServiceCatalogService(AppDbContext db, IFileStorageService fileStorage)
    {
        _db = db;
        _fileStorage = fileStorage;
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

    public async Task<DeleteServiceOutcome> DeleteAsync(Guid id)
    {
        var service = await _db.ClientPortalServices.FirstOrDefaultAsync(s => s.Id == id);
        if (service is null)
        {
            return new DeleteServiceOutcome { Success = false, ErrorMessage = "Service not found." };
        }

        // Submission is FK-restricted against Service at the DB level, so deleting a service
        // that clients have already used means explicitly clearing its submission history
        // first — B2 files for each generated document are deleted here since the DB cascade
        // (Submission -> GeneratedDocument) only cleans up rows, not the actual files.
        var submissions = await _db.ClientPortalSubmissions.Where(s => s.ServiceId == id).ToListAsync();
        if (submissions.Count > 0)
        {
            var submissionIds = submissions.Select(s => s.Id).ToList();
            var documents = await _db.ClientPortalGeneratedDocuments
                .Where(d => submissionIds.Contains(d.SubmissionId))
                .ToListAsync();
            foreach (var doc in documents)
            {
                await _fileStorage.DeleteFileAsync(doc.FileKey);
            }

            _db.ClientPortalSubmissions.RemoveRange(submissions);
        }

        var templates = await _db.ClientPortalDocumentTemplates.Where(t => t.ServiceId == id).ToListAsync();
        foreach (var template in templates)
        {
            await _fileStorage.DeleteFileAsync(template.TemplateFileKey);
        }

        _db.ClientPortalServices.Remove(service);
        await _db.SaveChangesAsync();
        return new DeleteServiceOutcome { Success = true };
    }
}
