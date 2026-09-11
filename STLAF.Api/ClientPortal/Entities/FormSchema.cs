using STLAF.Api.Common.Entities;

namespace STLAF.Api.ClientPortal.Entities;

public class FormSchema : BaseEntity
{
    public Guid DocumentTemplateId { get; set; }
    public DocumentTemplate DocumentTemplate { get; set; } = null!;
    public int Version { get; set; }

    public string FieldsJson { get; set; } = "[]";
}
