using STLAF.Api.Common.DTOs;

namespace STLAF.Api.Common.Services;

public interface IDocumentRequestService
{
    Task<List<DocumentRequestDto>> GetMyRequestsAsync(Guid userId);
    Task<DocumentRequestDto> CreateRequestAsync(Guid userId, CreateDocumentRequestDto dto, Stream? fileStream, string? fileName, string? contentType);

    Task<bool> IsExecutiveAssistantAsync(Guid userId);
    Task<List<DocumentRequestDto>> GetPendingEaAsync(Guid userId);
    Task<DocumentRequestDto?> DecideEaAsync(Guid userId, Guid requestId, DecideDocumentRequestDto dto);
    Task<List<DocumentRequestDto>> GetReturnedToEaAsync(Guid userId);
    Task<DocumentRequestDto?> ForwardRejectionAsync(Guid userId, Guid requestId);

    Task<bool> IsPartnerReviewerAsync(Guid userId);
    Task<List<DocumentRequestDto>> GetPendingPartnerAsync(Guid userId);
    Task<DocumentRequestDto?> DecidePartnerAsync(Guid userId, Guid requestId, DecideDocumentRequestDto dto);
    Task<List<DocumentRequestDto>> GetPartnerDashboardAsync();
}