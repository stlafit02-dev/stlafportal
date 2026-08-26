using STLAF.Api.ClientPortal.DTOs;

namespace STLAF.Api.ClientPortal.Services;

public interface IDocumentTemplateService
{
    Task<DocumentTemplateDto?> GetByServiceAsync(Guid serviceId);
    Task<DocumentTemplateDto> UploadAsync(Guid serviceId, Stream fileStream, string fileName, string contentType, List<TemplateFieldConfigDto> fieldConfig);
}
