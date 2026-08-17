using STLAF.Api.Departments.IT.DTOs;

namespace STLAF.Api.Departments.IT.Services;

public interface IGmailService
{
    Task<List<GwsAccountDto>> GetGwsAccountsAsync();
    Task<GwsAccountDto> CreateGwsAccountAsync(CreateGwsAccountDto dto);
    Task<GwsAccountDto?> UpdateGwsAccountAsync(Guid id, UpdateGwsAccountDto dto);
    Task<List<EmailAccountDto>> GetEmailAccountsAsync();
    Task<EmailAccountDto> CreateEmailAccountAsync(CreateEmailAccountDto dto, string updatedBy);
    Task<bool> DeleteEmailAccountAsync(Guid id, string updatedBy);
    Task<List<AppPasswordDto>> GetAppPasswordsAsync();
    Task<AppPasswordDto> CreateAppPasswordAsync(CreateAppPasswordDto dto);
    Task<int> DeleteExpiredAppPasswordsAsync();
    Task<EmailAccountDto?> UpdateEmailAccountAsync(Guid id, UpdateEmailAccountDto dto, string updatedBy);
    Task<EmailAccountDto?> RecycleEmailAccountAsync(Guid id, RecycleEmailAccountDto dto, string updatedBy);
    Task<int> BackfillEmployeeCompanyEmailsAsync();
}