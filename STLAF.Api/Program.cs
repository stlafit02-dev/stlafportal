using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using STLAF.Api.Data;
using STLAF.Api.Identity.Policies;
using STLAF.Api.Identity.Services;
using STLAF.Api.Announcements.Services;
using STLAF.Api.Departments.IT.Services;
using STLAF.Api.Departments.IT.BackgroundJobs;
using STLAF.Api.Departments.HRAdmin.Services;
using STLAF.Api.Common.Services;
using STLAF.Api.Common.Entities;

DotNetEnv.Env.Load();

Environment.SetEnvironmentVariable("DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE", "false");

var options = new WebApplicationOptions
{
    Args = args,
    EnvironmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
        ?? Environments.Production
};

var builder = WebApplication.CreateBuilder(options);

// Controllers + OpenAPI
builder.Services.AddControllers();
builder.Services.AddOpenApi();


// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Default")
    ));


// App services
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


// Authentication (JWT)
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
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:Secret"]!
                ))
        };
    });


// Authorization
builder.Services.AddScoped<IAuthorizationHandler, DepartmentAuthorizationHandler>();
builder.Services.AddScoped<IAuthorizationHandler, ModuleAuthorizationHandler>();

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
        "it-gmail"
    };

        foreach (var module in modules)
        {
            options.AddPolicy(module, policy =>
                policy.Requirements.Add(new ModuleRequirement(module)));
        }
});


// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://stlafportal.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


var app = builder.Build();


// Seed database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await DbSeeder.SeedAsync(db);
}


// Pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();