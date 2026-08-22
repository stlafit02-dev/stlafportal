using STLAF.Api.Common.DTOs;

namespace STLAF.Api.Common.Services;

public interface IIntakeFormService
{
    Task<List<IntakeGroupOptionDto>> GetCatalogAsync();
    Task<IntakeFormOptionsDto> GetFormOptionsAsync();
    Task<IntakeSubmissionResultDto> SubmitAsync(CreateIntakeSubmissionDto dto, Stream? fileStream, string? fileName, string? contentType);
    Task<List<IntakeSubmissionSummaryDto>> GetMySubmissionsAsync(Guid userId);
    Task<bool> IsPointPersonAsync(Guid userId);
}