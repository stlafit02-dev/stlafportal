using STLAF.Api.Common.Entities;

namespace STLAF.Api.ClientPortal.Entities;

public class DocumentTemplate : BaseEntity
{
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;

    public string TemplateFileKey { get; set; } = string.Empty;

    public string FieldConfigJson { get; set; } = "[]";
}
