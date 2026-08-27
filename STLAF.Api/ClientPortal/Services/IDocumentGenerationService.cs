namespace STLAF.Api.ClientPortal.Services;

public interface IDocumentGenerationService
{
    Task GenerateAsync(Guid submissionId);
}
