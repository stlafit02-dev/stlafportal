using Microsoft.EntityFrameworkCore;
using STLAF.Api.Announcements.DTOs;
using STLAF.Api.Common.Entities;
using STLAF.Api.Data;

namespace STLAF.Api.Announcements.Services;

public class AnnouncementService : IAnnouncementService
{
    private readonly AppDbContext _db;

    public AnnouncementService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<AnnouncementDto>> GetAllAsync()
    {
        return await _db.Announcements
            .OrderByDescending(a => a.PublishedAt)
            .Select(a => new AnnouncementDto
            {
                Id = a.Id,
                Title = a.Title,
                Body = a.Body,
                Department = a.Department,
                PublishedAt = a.PublishedAt
            })
            .ToListAsync();
    }

    public async Task<AnnouncementDto> CreateAsync(CreateAnnouncementDto dto, Guid createdBy)
    {
        var announcement = new Announcement
        {
            Title = dto.Title,
            Body = dto.Body,
            Department = dto.Department,
            PublishedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };

        _db.Announcements.Add(announcement);
        await _db.SaveChangesAsync();

        return new AnnouncementDto
        {
            Id = announcement.Id,
            Title = announcement.Title,
            Body = announcement.Body,
            Department = announcement.Department,
            PublishedAt = announcement.PublishedAt
        };
    }
}