using Microsoft.EntityFrameworkCore;
using STLAF.Api.Data;
using STLAF.Api.Departments.IT.DTOs;
using STLAF.Api.Departments.IT.Entities;

namespace STLAF.Api.Departments.IT.Services;

public class GmailService : IGmailService
{
    private readonly AppDbContext _db;

    public GmailService(AppDbContext db)
    {
        _db = db;
    }

    // ---------- GWS Accounts ----------

    public async Task<List<GwsAccountDto>> GetGwsAccountsAsync()
    {
        var accounts = await _db.GwsAccounts.OrderBy(a => a.Name).ToListAsync();

        var counts = await _db.EmailAccounts
            .Where(e => !e.Deleted)
            .GroupBy(e => new { e.GwsAccountId, e.Status })
            .Select(g => new { g.Key.GwsAccountId, g.Key.Status, Count = g.Count() })
            .ToListAsync();

        return accounts.Select(a => new GwsAccountDto
        {
            Id = a.Id,
            Name = a.Name,
            MaxCapacity = a.MaxCapacity,
            ActiveCount = counts.Where(c => c.GwsAccountId == a.Id && c.Status == "Active").Sum(c => c.Count),
            InactiveCount = counts.Where(c => c.GwsAccountId == a.Id && c.Status == "Inactive").Sum(c => c.Count),
            CreatedAt = a.CreatedAt
        }).ToList();
    }

    public async Task<GwsAccountDto> CreateGwsAccountAsync(CreateGwsAccountDto dto)
    {
        var account = new GwsAccount
        {
            Name = dto.Name,
            MaxCapacity = dto.MaxCapacity
        };

        _db.GwsAccounts.Add(account);
        await _db.SaveChangesAsync();

        return new GwsAccountDto
        {
            Id = account.Id,
            Name = account.Name,
            MaxCapacity = account.MaxCapacity,
            ActiveCount = 0,
            InactiveCount = 0,
            CreatedAt = account.CreatedAt
        };
    }

    public async Task<GwsAccountDto?> UpdateGwsAccountAsync(Guid id, UpdateGwsAccountDto dto)
    {
        var account = await _db.GwsAccounts.FirstOrDefaultAsync(a => a.Id == id);
        if (account is null) return null;

        account.Name = dto.Name;
        account.MaxCapacity = dto.MaxCapacity;
        await _db.SaveChangesAsync();

        var counts = await _db.EmailAccounts
            .Where(e => !e.Deleted && e.GwsAccountId == id)
            .GroupBy(e => e.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return new GwsAccountDto
        {
            Id = account.Id,
            Name = account.Name,
            MaxCapacity = account.MaxCapacity,
            ActiveCount = counts.FirstOrDefault(c => c.Status == "Active")?.Count ?? 0,
            InactiveCount = counts.FirstOrDefault(c => c.Status == "Inactive")?.Count ?? 0,
            CreatedAt = account.CreatedAt
        };
    }

    // ---------- Email Accounts (table: it_email_accounts) ----------

    public async Task<List<EmailAccountDto>> GetEmailAccountsAsync()
    {
        var accounts = await _db.EmailAccounts
            .Include(e => e.GwsAccount)
            .Where(e => !e.Deleted)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        return accounts.Select(ToEmailDto).ToList();
    }

    public async Task<EmailAccountDto> CreateEmailAccountAsync(CreateEmailAccountDto dto, string updatedBy)
    {
        var account = new EmailAccount
        {
            FullName = dto.FullName,
            OldUser = dto.OldUser,
            LocalGmail = dto.LocalGmail,
            StlafEmail = dto.StlafEmail,
            Password = dto.Password,
            Status = dto.Status,
            GwsAccountId = dto.GwsAccountId,
            Remarks = dto.Remarks,
            UpdatedBy = updatedBy
        };

        _db.EmailAccounts.Add(account);
        await _db.SaveChangesAsync();

        await _db.Entry(account).Reference(e => e.GwsAccount).LoadAsync();
        return ToEmailDto(account);
    }

    public async Task<EmailAccountDto?> UpdateEmailAccountAsync(Guid id, UpdateEmailAccountDto dto, string updatedBy)
    {
        var account = await _db.EmailAccounts.Include(e => e.GwsAccount).FirstOrDefaultAsync(e => e.Id == id);
        if (account is null) return null;

        account.FullName = dto.FullName;
        account.OldUser = dto.OldUser;
        account.Password = dto.Password;
        account.Status = dto.Status;
        account.Remarks = dto.Remarks;
        account.UpdatedBy = updatedBy;
        await _db.SaveChangesAsync();

        return ToEmailDto(account);
    }

    public async Task<EmailAccountDto?> RecycleEmailAccountAsync(Guid id, RecycleEmailAccountDto dto, string updatedBy)
    {
        var account = await _db.EmailAccounts.Include(e => e.GwsAccount).FirstOrDefaultAsync(e => e.Id == id);
        if (account is null) return null;

        account.OldUser = account.FullName;
        account.OldStlafEmail = account.StlafEmail;
        account.FullName = dto.NewFullName;
        account.StlafEmail = dto.NewStlafEmail;
        account.Status = "Active";
        account.Recycled = true;
        account.RecycledAt = DateTime.UtcNow;
        account.UpdatedBy = updatedBy;
        await _db.SaveChangesAsync();

        return ToEmailDto(account);
    }

    public async Task<bool> DeleteEmailAccountAsync(Guid id, string updatedBy)
    {
        var account = await _db.EmailAccounts.FirstOrDefaultAsync(e => e.Id == id);
        if (account is null) return false;

        account.Deleted = true;
        account.DeleteAt = DateTime.UtcNow;
        account.UpdatedBy = updatedBy;
        await _db.SaveChangesAsync();
        return true;
    }

    // ---------- App Passwords ----------

    public async Task<List<AppPasswordDto>> GetAppPasswordsAsync()
    {
        var entries = await _db.AppPasswords
            .Include(p => p.GwsAccount)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        var now = DateTime.UtcNow;

        return entries.Select(p =>
        {
            var expiresAt = p.CreatedAt.AddMonths(1);
            return new AppPasswordDto
            {
                Id = p.Id,
                GwsAccountId = p.GwsAccountId,
                GwsAccountName = p.GwsAccount.Name,
                AppPasswordValue = p.AppPasswordValue,
                Month = p.Month,
                Year = p.Year,
                Notes = p.Notes,
                Status = now >= expiresAt ? "Expired" : "Active",
                ExpiresAt = expiresAt,
                CreatedAt = p.CreatedAt
            };
        }).ToList();
    }

    public async Task<int> DeleteExpiredAppPasswordsAsync()
    {
        var cutoff = DateTime.UtcNow.AddMonths(-1);
        var expired = await _db.AppPasswords.Where(p => p.CreatedAt <= cutoff).ToListAsync();

        if (expired.Count == 0) return 0;

        _db.AppPasswords.RemoveRange(expired);
        await _db.SaveChangesAsync();
        return expired.Count;
    }

    public async Task<AppPasswordDto> CreateAppPasswordAsync(CreateAppPasswordDto dto)
    {
        var entry = new AppPassword
        {
            GwsAccountId = dto.GwsAccountId,
            AppPasswordValue = dto.AppPasswordValue,
            Month = dto.Month,
            Year = dto.Year,
            Notes = dto.Notes
        };

        _db.AppPasswords.Add(entry);
        await _db.SaveChangesAsync();

        await _db.Entry(entry).Reference(p => p.GwsAccount).LoadAsync();

        return new AppPasswordDto
        {
            Id = entry.Id,
            GwsAccountId = entry.GwsAccountId,
            GwsAccountName = entry.GwsAccount.Name,
            AppPasswordValue = entry.AppPasswordValue,
            Month = entry.Month,
            Year = entry.Year,
            Notes = entry.Notes,
            CreatedAt = entry.CreatedAt
        };
    }

    private static EmailAccountDto ToEmailDto(EmailAccount e) => new()
    {
        Id = e.Id,
        FullName = e.FullName,
        LocalGmail = e.LocalGmail,
        Password = e.Password,
        StlafEmail = e.StlafEmail,
        OldUser = e.OldUser,
        OldStlafEmail = e.OldStlafEmail,
        Status = e.Status,
        GwsAccountId = e.GwsAccountId,
        GwsAccountName = e.GwsAccount.Name,
        Remarks = e.Remarks,
        Recycled = e.Recycled,
        CreatedAt = e.CreatedAt
    };
}