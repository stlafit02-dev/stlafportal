using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;

namespace STLAF.Api.Common.Services;

public class SmtpEmailSender : IEmailSender
{
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(ILogger<SmtpEmailSender> logger)
    {
        _logger = logger;
    }

    public async Task SendAsync(string fromEmail, string fromAppPassword, string toEmail, string subject, string body)
    {
        try
        {
            using var client = new SmtpClient("smtp.gmail.com", 587)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(fromEmail, fromAppPassword.Replace(" ", ""))
            };

            using var message = new MailMessage(fromEmail, toEmail, subject, body) { IsBodyHtml = true };
            await client.SendMailAsync(message);
            _logger.LogInformation("Email sent successfully from {From} to {To}.", fromEmail, toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send leave notification email to {ToEmail}", toEmail);
        }
    }

    public async Task<(bool Success, string? Error)> TestConnectionAsync(string fromEmail, string fromAppPassword)
    {
        try
        {
            using var client = new SmtpClient("smtp.gmail.com", 587)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(fromEmail, fromAppPassword.Replace(" ", ""))
            };

            using var message = new MailMessage(fromEmail, fromEmail, "STLAF App Password Test", "This is an automated test to confirm this app password is still valid. You can ignore this email.");
            await client.SendMailAsync(message);
            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }
}