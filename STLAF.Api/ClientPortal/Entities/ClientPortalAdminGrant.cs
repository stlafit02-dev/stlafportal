using STLAF.Api.Common.Entities;

namespace STLAF.Api.ClientPortal.Entities;

// Per-employee grant of access to the client portal admin screens in STLAF.Client,
// keyed on the staff User.Id (not office position, unlike ModuleAccessPosition).
public class ClientPortalAdminGrant : BaseEntity
{
    public Guid UserId { get; set; }
}
