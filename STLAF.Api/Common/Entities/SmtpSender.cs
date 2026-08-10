namespace STLAF.Api.Common.Entities;

public class SmtpSender : BaseEntity
{
    public string Label { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string AppPasswordValue { get; set; } = string.Empty;
}