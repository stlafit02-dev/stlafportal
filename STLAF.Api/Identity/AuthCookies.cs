namespace STLAF.Api.Identity;

public static class AuthCookies
{
    public const string TokenCookieName = "stlaf_token";

    public static CookieOptions BuildTokenOptions(IWebHostEnvironment environment, DateTimeOffset? expires)
    {
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
