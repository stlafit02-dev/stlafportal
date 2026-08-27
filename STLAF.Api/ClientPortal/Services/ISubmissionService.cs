using STLAF.Api.ClientPortal.DTOs;

namespace STLAF.Api.ClientPortal.Services;

public class SubmissionOutcome
{
    public SubmissionDto? Result { get; set; }
    public string? ErrorMessage { get; set; }
}

public interface ISubmissionService
{
    Task<SubmissionOutcome> CreateAsync(Guid clientId, CreateSubmissionDto dto);
    Task<List<SubmissionDto>> GetMineAsync(Guid clientId);
    Task<bool> RetryGenerationAsync(Guid clientId, Guid submissionId);
}
