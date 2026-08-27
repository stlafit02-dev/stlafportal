using Microsoft.EntityFrameworkCore;
using STLAF.Api.ClientPortal.DTOs;
using STLAF.Api.ClientPortal.Entities;
using STLAF.Api.Data;

namespace STLAF.Api.ClientPortal.Services;

public class VoucherService : IVoucherService
{
    private readonly AppDbContext _db;

    public VoucherService(AppDbContext db)
    {
        _db = db;
    }

    private static VoucherCodeDto Map(VoucherCode v) => new()
    {
        Id = v.Id,
        Code = v.Code,
        DurationDays = v.DurationDays,
        VoucherExpiresAt = v.VoucherExpiresAt,
        IsUsed = v.IsUsed,
        RedeemedAt = v.RedeemedAt,
        CreatedAt = v.CreatedAt
    };

    public async Task<(RedeemVoucherResultDto? Result, string? Error)> RedeemAsync(Guid clientId, string code)
    {
        var normalizedCode = code.Trim().ToUpperInvariant();
        var now = DateTime.UtcNow;

        await using var transaction = await _db.Database.BeginTransactionAsync();

        // The WHERE clause is itself the concurrency guard: this UPDATE only affects a row
        // that is still unused, so a racing second redemption of the same code matches zero
        // rows once the first commits.
        var affected = await _db.ClientPortalVoucherCodes
            .Where(v => v.Code == normalizedCode
                && !v.IsUsed
                && (v.VoucherExpiresAt == null || v.VoucherExpiresAt > now))
            .ExecuteUpdateAsync(s => s
                .SetProperty(v => v.IsUsed, true)
                .SetProperty(v => v.RedeemedByClientAccountId, clientId)
                .SetProperty(v => v.RedeemedAt, now)
                .SetProperty(v => v.UpdatedAt, now));

        if (affected == 0)
        {
            return (null, "Invalid or expired code.");
        }

        var voucher = await _db.ClientPortalVoucherCodes.FirstAsync(v => v.Code == normalizedCode);
        var expiresAt = voucher.DurationDays.HasValue ? now.AddDays(voucher.DurationDays.Value) : (DateTime?)null;

        var subscription = await _db.ClientPortalSubscriptions.FirstOrDefaultAsync(s => s.ClientAccountId == clientId);
        if (subscription is null)
        {
            subscription = new Subscription { ClientAccountId = clientId };
            _db.ClientPortalSubscriptions.Add(subscription);
        }

        subscription.Plan = voucher.PlanGrants;
        subscription.Status = "active";
        subscription.ActivatedAt = now;
        subscription.ExpiresAt = expiresAt;
        subscription.VoucherCodeId = voucher.Id;
        subscription.UpdatedAt = now;

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return (new RedeemVoucherResultDto { Plan = voucher.PlanGrants, ExpiresAt = expiresAt }, null);
    }

    public async Task<VoucherCodeDto> GenerateAsync(Guid staffUserId, GenerateVoucherDto dto)
    {
        var code = Guid.NewGuid().ToString("N")[..10].ToUpperInvariant();

        var voucher = new VoucherCode
        {
            Code = code,
            PlanGrants = "premium",
            DurationDays = dto.DurationDays,
            VoucherExpiresAt = dto.VoucherExpiresAt,
            CreatedByUserId = staffUserId
        };

        _db.ClientPortalVoucherCodes.Add(voucher);
        await _db.SaveChangesAsync();

        return Map(voucher);
    }

    public async Task<List<VoucherCodeDto>> ListAsync()
    {
        var vouchers = await _db.ClientPortalVoucherCodes
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();

        return vouchers.Select(Map).ToList();
    }
}
