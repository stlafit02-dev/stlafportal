namespace STLAF.Api.Common.Entities;

public class ModuleAccessPosition : BaseEntity
{
    public string Module { get; set; } = string.Empty;
    public string OfficePosition { get; set; } = string.Empty;
}