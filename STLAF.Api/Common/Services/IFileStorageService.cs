namespace STLAF.Api.Common.Services;

public interface IFileStorageService
{
    Task<(string objectKey, string url)?> UploadFileAsync(Stream fileStream, string fileName, string contentType, string folder = "medical-certificates");
    Task<string?> GetSignedUrlAsync(string objectKey);
    Task<Stream?> DownloadFileAsync(string objectKey);
    Task<bool> DeleteFileAsync(string objectKey);
    Task<(bool Success, string? Error)> TestConnectionAsync();
}