namespace STLAF.Api.Common.Services;

public interface IFileStorageService
{
    Task<(string objectKey, string url)?> UploadFileAsync(Stream fileStream, string fileName, string contentType);
    Task<string?> GetSignedUrlAsync(string objectKey);
    Task<(bool Success, string? Error)> TestConnectionAsync();
}