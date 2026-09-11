using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using STLAF.Api.Data;
using STLAF.Api.Identity;
using STLAF.Api.Identity.Policies;
using STLAF.Api.Identity.Services;
using STLAF.Api.Announcements.Services;
using STLAF.Api.Departments.IT.Services;
using STLAF.Api.Departments.IT.BackgroundJobs;
using STLAF.Api.Departments.HRAdmin.Services;
using STLAF.Api.Common.Services;
using STLAF.Api.ClientPortal.Policies;
using STLAF.Api.ClientPortal.Services;
using STLAF.Api.ClientPortal.BackgroundJobs;

DotNetEnv.Env.Load();

Environment.SetEnvironmentVariable("DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE", "false");

var options = new WebApplicationOptions
{
    Args = args,
    EnvironmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
        ?? Environments.Production
};

var builder = WebApplication.CreateBuilder(options);

builder.Services.AddControllers();
builder.Services.AddOpenApi();


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Default")
    ));


builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
builder.Services.AddScoped<ITicketingService, TicketingService>();
builder.Services.AddScoped<IAssetService, AssetService>();
builder.Services.AddScoped<IGmailService, GmailService>();
builder.Services.AddHostedService<AppPasswordCleanupService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<ILeaveService, LeaveService>();
builder.Services.AddScoped<IOvertimeService, OvertimeService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IUndertimeService, UndertimeService>();
builder.Services.AddScoped<IFileStorageService, BackblazeFileStorageService>();
builder.Services.AddScoped<IDocumentRequestService, DocumentRequestService>();
builder.Services.AddScoped<IIntakeFormService, IntakeFormService>();
builder.Services.AddScoped<IClientAuthService, ClientAuthService>();
builder.Services.AddScoped<IServiceCatalogService, ServiceCatalogService>();
builder.Services.AddScoped<IFormSchemaService, FormSchemaService>();
builder.Services.AddScoped<IDocumentTemplateService, DocumentTemplateService>();
builder.Services.AddScoped<ISubmissionService, SubmissionService>();
builder.Services.AddScoped<IDocumentGenerationService, DocumentGenerationService>();
builder.Services.AddScoped<IDocumentsService, DocumentsService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddHostedService<SubscriptionExpiryService>();
builder.Services.AddHostedService<LibreOfficeWarmupService>();



builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = 2;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});


builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        var userId = httpContext.User.Identity?.IsAuthenticated == true
            ? httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? httpContext.User.FindFirst("sub")?.Value
            : null;

        var key = userId is not null
            ? $"user:{userId}"
            : $"ip:{httpContext.Connection.RemoteIpAddress}";

        return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 100,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        });
    });

    options.AddPolicy("login", httpContext =>
    {
        var key = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        });
    });

    options.AddPolicy("public-submission", httpContext =>
    {
        var key = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        });
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudiences = new[]
            {
                builder.Configuration["Jwt:Audience"],
                builder.Configuration["Jwt:ClientAudience"]
            },

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:Secret"]!
                ))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (string.IsNullOrEmpty(context.Token) &&
                    context.Request.Cookies.TryGetValue(AuthCookies.TokenCookieName, out var cookieToken))
                {
                    context.Token = cookieToken;
                }

                return Task.CompletedTask;
            }
        };
    });


builder.Services.AddScoped<IAuthorizationHandler, DepartmentAuthorizationHandler>();
builder.Services.AddScoped<IAuthorizationHandler, ModuleAuthorizationHandler>();
builder.Services.AddScoped<IAuthorizationHandler, ClientAccountAuthorizationHandler>();
builder.Services.AddScoped<IAuthorizationHandler, ClientPortalAdminAuthorizationHandler>();

builder.Services.AddAuthorization(options =>
{
    var departments = new[]
    {
        "IT",
        "HRAdmin",
        "Litigation",
        "Accounting",
        "Corporate",
        "Marketing",
        "Partner"
    };

    foreach (var dept in departments)
    {
        options.AddPolicy(dept, policy =>
            policy.Requirements.Add(
                new DepartmentRequirement(dept)
            ));
    }
    var modules = new[]
    {
        "hr-employees",
        "hr-leave-settings",
        "hr-medical-certificates",
        "hr-reports",
        "it-ticketing",
        "it-assets",
        "it-gmail",
        "document-ea-review",
        "document-partner-review"
    };

    foreach (var module in modules)
    {
        options.AddPolicy(module, policy =>
            policy.Requirements.Add(new ModuleRequirement(module)));
    }

    options.AddPolicy("ClientAccount", policy =>
        policy.Requirements.Add(new ClientAccountRequirement()));

    options.AddPolicy("client-portal-admin", policy =>
        policy.Requirements.Add(new ClientPortalAdminRequirement()));
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "https://stlafportal.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await DbSeeder.SeedAsync(db);
}


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseForwardedHeaders();
app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();