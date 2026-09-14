using STLAF.Api.Departments.IT.DTOs;

namespace STLAF.Api.Departments.IT.Services;

public interface IInternAccountService
{
    Task<List<InternAccountDto>> GetInternsAsync();
    Task<InternAccountDto> CreateInternAsync(CreateInternAccountDto dto);
    Task<InternAccountDto?> UpdateInternAsync(Guid id, UpdateInternAccountDto dto);
}
