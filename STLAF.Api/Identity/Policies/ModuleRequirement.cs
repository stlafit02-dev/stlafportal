using Microsoft.AspNetCore.Authorization;

namespace STLAF.Api.Identity.Policies;

public class ModuleRequirement : IAuthorizationRequirement
{
    public string Module { get; }
    public ModuleRequirement(string module) => Module = module;
}