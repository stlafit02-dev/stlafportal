using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;

namespace STLAF.Api.Common.Services;

public class BackblazeFileStorageService : IFileStorageService
{
    private readonly IConfiguration _config;
    private readonly ILogger<BackblazeFileStorageService> _logger;

    public BackblazeFileStorageService(IConfiguration config, ILogger<BackblazeFileStorageService> logger)
    {
        _config = config;
        _logger = logger;
    }

    private AmazonS3Client? BuildClient(out string? bucketName)
    {
        var keyId = _config["Backblaze:KeyId"];
        var appKey = _config["Backblaze:ApplicationKey"];
        var endpoint = _config["Backblaze:Endpoint"];
        bucketName = _config["Backblaze:BucketName"];

        if (string.IsNullOrWhiteSpace(keyId) || string.IsNullOrWhiteSpace(appKey) ||
            string.IsNullOrWhiteSpace(endpoint) || string.IsNullOrWhiteSpace(bucketName))
        {
            _logger.LogWarning("Backblaze storage is not fully configured (KeyId/ApplicationKey/Endpoint/BucketName).");
            return null;
        }

        var config = new AmazonS3Config
        {
            ServiceURL = $"https://{endpoint}",
            ForcePathStyle = true
        };

        return new AmazonS3Client(new BasicAWSCredentials(keyId, appKey), config);
    }

    public async Task<(string objectKey, string url)?> UploadFileAsync(Stream fileStream, string fileName, string contentType, string folder = "medical-certificates")
    {
        var client = BuildClient(out var bucketName);
        if (client is null || bucketName is null) return null;

        var objectKey = $"{folder}/{Guid.NewGuid()}-{fileName}";

        try
        {
            var putRequest = new PutObjectRequest
            {
                BucketName = bucketName,
                Key = objectKey,
                InputStream = fileStream,
                ContentType = contentType
            };

            await client.PutObjectAsync(putRequest);

            var url = await GetSignedUrlInternalAsync(client, bucketName, objectKey);
            return (objectKey, url);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload {FileName} to Backblaze B2.", fileName);
            return null;
        }
    }

    public async Task<string?> GetSignedUrlAsync(string objectKey)
    {
        var client = BuildClient(out var bucketName);
        if (client is null || bucketName is null) return null;

        return await GetSignedUrlInternalAsync(client, bucketName, objectKey);
    }

    private Task<string> GetSignedUrlInternalAsync(AmazonS3Client client, string bucketName, string objectKey)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = bucketName,
            Key = objectKey,
            Expires = DateTime.UtcNow.AddHours(1),
            Verb = HttpVerb.GET
        };

        return Task.FromResult(client.GetPreSignedURL(request));
    }

    public async Task<Stream?> DownloadFileAsync(string objectKey)
    {
        var client = BuildClient(out var bucketName);
        if (client is null || bucketName is null) return null;

        try
        {
            var response = await client.GetObjectAsync(new GetObjectRequest
            {
                BucketName = bucketName,
                Key = objectKey
            });

            var memoryStream = new MemoryStream();
            await response.ResponseStream.CopyToAsync(memoryStream);
            memoryStream.Position = 0;
            return memoryStream;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download {ObjectKey} from Backblaze B2.", objectKey);
            return null;
        }
    }

    public async Task<(bool Success, string? Error)> TestConnectionAsync()
    {
        var testContent = System.Text.Encoding.UTF8.GetBytes("STLAF Portal Backblaze B2 connection test.");
        using var stream = new MemoryStream(testContent);

        var result = await UploadFileAsync(stream, $"connection-test-{DateTime.UtcNow:yyyyMMdd-HHmmss}.txt", "text/plain");

        if (result is null)
        {
            return (false, "Upload returned null — check Backblaze KeyId/ApplicationKey/Endpoint/BucketName in configuration, and the backend logs for the specific error.");
        }

        return (true, null);
    }
}