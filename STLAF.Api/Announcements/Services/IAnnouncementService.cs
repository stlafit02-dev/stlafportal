using STLAF.Api.Announcements.DTOs;

namespace STLAF.Api.Announcements.Services;

public interface IAnnouncementService
{
    Task<List<AnnouncementDto>> GetAllAsync();
    Task<AnnouncementDto> CreateAsync(CreateAnnouncementDto dto, Guid createdBy);
}