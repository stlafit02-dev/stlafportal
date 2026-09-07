namespace STLAF.Api.Identity;

/// <summary>
/// Shared name/options for the httpOnly staff session cookie, used both when
/// issuing it (AuthController) and when reading it back (Program.cs's JWT
/// bearer OnMessageReceived fallback) so the two never drift apart.
/// </summary>
public static class AuthCookies
{
    public const string TokenCookieName = "stlaf_token";

    public static CookieOptions BuildTokenOptions(IWebHostEnvironment environment, DateTimeOffset? expires)
    {
        // Frontend and API are on different origins, so the cookie needs SameSite=None (which
        // requires Secure) to be sent cross-site. Relaxed for local http://localhost dev only.
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = !environment.IsDevelopment(),
            SameSite = environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
            Expires = expires,
            Path = "/"
        };
    }
}
