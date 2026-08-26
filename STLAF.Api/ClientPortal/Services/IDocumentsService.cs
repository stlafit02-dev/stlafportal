using STLAF.Api.ClientPortal.DTOs;

namespace STLAF.Api.ClientPortal.Services;

public interface IDocumentsService
{
    Task<List<MyDocumentDto>> GetMineAsync(Guid clientId);
    Task<MyDocumentDto?> GetForSubmissionAsync(Guid clientId, Guid submissionId);
}
