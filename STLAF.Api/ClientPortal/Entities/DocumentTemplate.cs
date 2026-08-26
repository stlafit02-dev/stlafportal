using STLAF.Api.Common.Entities;

namespace STLAF.Api.ClientPortal.Entities;

public class DocumentTemplate : BaseEntity
{
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;

    // Backblaze B2 object key for the base template — either a real fillable PDF form
    // (AcroForm) or a Word .docx with {{field_key}} text placeholders. Which one applies
    // is inferred from this key's file extension at generation time.
    public string TemplateFileKey { get; set; } = string.Empty;

    // JSON array of { fieldKey, blurOnFree } — which of the template's fields (PDF
    // AcroForm field names, or docx {{field_key}} tokens) should stay blank for free-plan
    // clients. No coordinates needed: the template's own layout is used as-is.
    public string FieldConfigJson { get; set; } = "[]";
}
