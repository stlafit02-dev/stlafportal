using STLAF.Api.Common.Entities;

namespace STLAF.Api.ClientPortal.Entities;

public class ClientAccount : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
