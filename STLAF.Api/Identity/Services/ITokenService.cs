using STLAF.Api.ClientPortal.Entities;
using STLAF.Api.Identity.Entities;

namespace STLAF.Api.Identity.Services;

public interface ITokenService
{
    (string token, DateTime expiresAt) GenerateToken(User user, string departmentName, string roleName, string? officePosition);
    (string token, DateTime expiresAt) GenerateClientToken(ClientAccount client);
}