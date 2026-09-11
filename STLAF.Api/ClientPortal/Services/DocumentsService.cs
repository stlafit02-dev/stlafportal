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

    public async Task<List<AdminGeneratedDocumentDto>> GetAllForAdminAsync()
    {
        var rows = await (
            from doc in _db.ClientPortalGeneratedDocuments
            join sub in _db.ClientPortalSubmissions on doc.SubmissionId equals sub.Id
            join svc in _db.ClientPortalServices on sub.ServiceId equals svc.Id
            join client in _db.ClientAccounts on sub.ClientAccountId equals client.Id
            orderby doc.CreatedAt descending
            select new
            {
                doc.Id,
                doc.SubmissionId,
                sub.ServiceId,
                ServiceName = svc.Name,
                ClientEmail = client.Email,
                ClientFullName = client.FullName,
                doc.FileKey,
                doc.CreatedAt
            }
        ).ToListAsync();

        var result = new List<AdminGeneratedDocumentDto>();
        foreach (var row in rows)
        {
            var url = await _fileStorage.GetSignedUrlAsync(row.FileKey);
            if (url is null) continue;

            result.Add(new AdminGeneratedDocumentDto
            {
                Id = row.Id,
                SubmissionId = row.SubmissionId,
                ServiceId = row.ServiceId,
                ServiceName = row.ServiceName,
                ClientEmail = row.ClientEmail,
                ClientFullName = row.ClientFullName,
                DownloadUrl = url,
                GeneratedAt = row.CreatedAt
            });
        }

        return result;
    }

    public async Task<bool> DeleteAsync(Guid documentId)
    {
        var document = await _db.ClientPortalGeneratedDocuments.FirstOrDefaultAsync(d => d.Id == documentId);
        if (document is null) return false;

        var submission = await _db.ClientPortalSubmissions.FirstOrDefaultAsync(s => s.Id == document.SubmissionId);
        if (submission is null) return false;

        var allDocumentsForSubmission = await _db.ClientPortalGeneratedDocuments
            .Where(d => d.SubmissionId == submission.Id)
            .ToListAsync();
        foreach (var doc in allDocumentsForSubmission)
        {
            await _fileStorage.DeleteFileAsync(doc.FileKey);
        }

        _db.ClientPortalSubmissions.Remove(submission);
        await _db.SaveChangesAsync();
        return true;
    }
}
