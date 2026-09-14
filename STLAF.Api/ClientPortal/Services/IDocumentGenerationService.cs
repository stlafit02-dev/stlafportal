namespace STLAF.Api.ClientPortal.Services;

public interface IDocumentGenerationService
{
    Task GenerateAsync(Guid submissionId);

    Task<byte[]?> RenderPreviewAsync(Guid clientId, Guid serviceId, Dictionary<string, object?> responses);
}
