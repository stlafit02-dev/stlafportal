using Microsoft.EntityFrameworkCore;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.Common.Services;
using STLAF.Api.Data;

namespace STLAF.Api.ClientPortal.Services;

public class DocumentsService : IDocumentsService
{
    private readonly AppDbContext _db;
    private readonly IFileStorageService _fileStorage;

    public DocumentsService(AppDbContext db, IFileStorageService fileStorage)
    {
        _db = db;
        _fileStorage = fileStorage;
    }

    public async Task<List<MyDocumentDto>> GetMineAsync(Guid clientId)
    {
        var rows = await (
            from doc in _db.ClientPortalGeneratedDocuments
            join sub in _db.ClientPortalSubmissions on doc.SubmissionId equals sub.Id
            where sub.ClientAccountId == clientId
            select new { doc.Id, doc.SubmissionId, sub.ServiceId, doc.FileKey, doc.CreatedAt }
        ).ToListAsync();

        // A submission can have multiple generated documents if generation was retried —
        // only the most recent one per submission is worth showing.
        var latestPerSubmission = rows
            .GroupBy(r => r.SubmissionId)
            .Select(g => g.OrderByDescending(r => r.CreatedAt).First())
            .OrderByDescending(r => r.CreatedAt)
            .ToList();

        var result = new List<MyDocumentDto>();
        foreach (var row in latestPerSubmission)
        {
            var url = await _fileStorage.GetSignedUrlAsync(row.FileKey);
            if (url is null) continue;

            result.Add(new MyDocumentDto
            {
                Id = row.Id,
                SubmissionId = row.SubmissionId,
                ServiceId = row.ServiceId,
                DownloadUrl = url,
                GeneratedAt = row.CreatedAt
            });
        }

        return result;
    }

    public async Task<MyDocumentDto?> GetForSubmissionAsync(Guid clientId, Guid submissionId)
    {
        var row = await (
            from doc in _db.ClientPortalGeneratedDocuments
            join sub in _db.ClientPortalSubmissions on doc.SubmissionId equals sub.Id
            where sub.ClientAccountId == clientId && sub.Id == submissionId
            orderby doc.CreatedAt descending
            select new { doc.Id, doc.SubmissionId, sub.ServiceId, doc.FileKey, doc.CreatedAt }
        ).FirstOrDefaultAsync();

        if (row is null) return null;

        var url = await _fileStorage.GetSignedUrlAsync(row.FileKey);
        if (url is null) return null;

        return new MyDocumentDto
        {
            Id = row.Id,
            SubmissionId = row.SubmissionId,
            ServiceId = row.ServiceId,
            DownloadUrl = url,
            GeneratedAt = row.CreatedAt
        };
    }
}
