namespace STLAF.Api.ClientPortal.DTOs;

public class FieldOptionDto
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
}

public class FieldValidationDto
{
    public int? MinLength { get; set; }
    public int? MaxLength { get; set; }
    public double? Min { get; set; }
    public double? Max { get; set; }
    public string? Pattern { get; set; }
    public string? PatternMessage { get; set; }
}

public class FieldConditionalDto
{
    public string Field { get; set; } = string.Empty;
    public string Operator { get; set; } = string.Empty; // eq | neq | in | notEmpty
    public object? Value { get; set; }
}

public class FieldDefinitionDto
{
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Type { get; set; } = "text";
    public bool Required { get; set; }
    public List<FieldOptionDto>? Options { get; set; }
    public FieldValidationDto? Validation { get; set; }
    public FieldConditionalDto? Conditional { get; set; }
    public string? HelpText { get; set; }
    public string? Placeholder { get; set; }
}

public class FormSchemaDto
{
    public Guid Id { get; set; }
    public Guid ServiceId { get; set; }
    public int Version { get; set; }
    public List<FieldDefinitionDto> Fields { get; set; } = new();
}

public class SaveFormSchemaDto
{
    public List<FieldDefinitionDto> Fields { get; set; } = new();
}
