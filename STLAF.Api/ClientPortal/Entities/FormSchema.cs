using STLAF.Api.Common.Entities;

namespace STLAF.Api.ClientPortal.Entities;

public class FormSchema : BaseEntity
{
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
    public int Version { get; set; }

    // JSON array of field definitions (key, label, type, required, options, validation, conditional...).
    public string FieldsJson { get; set; } = "[]";
}
