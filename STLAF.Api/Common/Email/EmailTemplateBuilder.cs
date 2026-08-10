namespace STLAF.Api.Common.Email;

public static class EmailTemplateBuilder
{
    public static string Build(string heading, string bodyHtml, string? buttonText = null, string? buttonUrl = null)
    {
        var buttonHtml = !string.IsNullOrWhiteSpace(buttonText) && !string.IsNullOrWhiteSpace(buttonUrl)
            ? $@"<tr>
                  <td style=""padding: 28px 32px 8px;"" align=""center"">
                    <a href=""{buttonUrl}"" style=""background: linear-gradient(135deg, #E8C468, #CCAA49); color: #1A2634; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 30px; border-radius: 8px; display: inline-block; font-family: Arial, sans-serif;"">{buttonText}</a>
                  </td>
                </tr>"
            : "";

        return $@"<!DOCTYPE html>
<html>
<body style=""margin:0; padding:0; background-color:#F4F1EA; font-family: Arial, sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#F4F1EA; padding: 32px 0;"">
    <tr>
      <td align=""center"">
        <table width=""520"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);"">
          <tr>
            <td style=""background-color:#1A2634; padding: 24px 32px;"" align=""center"">
              <span style=""font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; color:#ffffff;"">ST<span style=""color:#CCAA49;"">LAF</span></span>
              <div style=""font-size: 10px; letter-spacing: 1px; color:#9AA5B1; text-transform:uppercase; margin-top: 4px;"">Sadsad Tamesis Legal and Accountancy Firm</div>
            </td>
          </tr>
          <tr>
            <td style=""padding: 32px 32px 8px;"">
              <h2 style=""margin:0 0 16px; font-family: Georgia, serif; font-size: 20px; color:#1A2634;"">{heading}</h2>
              <div style=""font-size: 14px; line-height: 1.6; color:#333333;"">
                {bodyHtml}
              </div>
            </td>
          </tr>
          {buttonHtml}
          <tr>
            <td style=""padding: 24px 32px 28px;"">
              <hr style=""border:none; border-top:1px solid #EAE6DA; margin: 0 0 16px;"" />
              <p style=""font-size: 11px; color:#9AA5B1; margin:0;"">This is an automated message from the STLAF Portal. Please do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
    }

    public static string InfoRow(string label, string value) =>
        $@"<p style=""margin:4px 0;""><strong style=""color:#1A2634;"">{label}:</strong> {value}</p>";
}