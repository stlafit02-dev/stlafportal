namespace STLAF.Api.ClientPortal.DTOs;

public class TemplateFieldConfigDto
{
    public string FieldKey { get; set; } = string.Empty;
    public bool BlurOnFree { get; set; }
}

public class DocumentTemplateDto
{
    public Guid Id { get; set; }
    public Guid ServiceId { get; set; }
    public string TemplateFileKey { get; set; } = string.Empty;
    public List<TemplateFieldConfigDto> FieldConfig { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}
