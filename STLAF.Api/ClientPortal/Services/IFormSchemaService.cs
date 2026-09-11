using STLAF.Api.ClientPortal.DTOs;

namespace STLAF.Api.ClientPortal.Services;

public interface IFormSchemaService
{
    Task<FormSchemaDto?> GetLatestAsync(Guid serviceId);
}
