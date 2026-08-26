namespace STLAF.Api.ClientPortal.DTOs;

public class CreateSubmissionDto
{
    public Guid ServiceId { get; set; }
    public int FormSchemaVersion { get; set; }
    public Dictionary<string, object?> Responses { get; set; } = new();
}

public class SubmissionDto
{
    public Guid Id { get; set; }
    public Guid ServiceId { get; set; }
    public int FormSchemaVersion { get; set; }
    public Dictionary<string, object?> Responses { get; set; } = new();
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class MyDocumentDto
{
    public Guid Id { get; set; }
    public Guid SubmissionId { get; set; }
    public Guid ServiceId { get; set; }
    public string DownloadUrl { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
}
