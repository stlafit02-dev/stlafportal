namespace STLAF.Api.Common.Services;

public interface IEmailSender
{
    Task SendAsync(string fromEmail, string fromAppPassword, string toEmail, string subject, string body);
    Task<(bool Success, string? Error)> TestConnectionAsync(string fromEmail, string fromAppPassword);
}