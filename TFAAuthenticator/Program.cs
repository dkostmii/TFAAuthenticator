using FluentValidation;
using TFAAuthenticator.Contracts;

using OtpNet;
using TFAAuthenticator.Options;
using Microsoft.Extensions.Options;
using System.Text;

using System.Security.Cryptography;
using System.Text.RegularExpressions;

using SimpleBase;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IValidator<AuthRequest>, AuthRequestValidator>();

builder.Services.AddOptions<TOTPOptions>()
    .Bind(builder.Configuration.GetRequiredSection(TOTPOptions.TOTP))
    .ValidateDataAnnotations()
    .ValidateOnStart();

var applicationOriginPolicy = "TFAAuthenticator.App";

builder.Services.AddCors(opts =>
{
    opts.AddPolicy(
        name: applicationOriginPolicy,
        policy =>
        {
            policy
                //.WithHeaders("Origin", "X-Requested-With", "Content-Type", "Accept")
                .WithOrigins("http://localhost:80", "http://localhost")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

byte[] ComputeSecretHash(IOptions<TOTPOptions> opts)
{
    var secret = opts.Value.Secret;
    var secretBytes = Encoding.UTF8.GetBytes(secret);

    var hash = SHA1.HashData(secretBytes);

    return hash;
}

app.MapGet("/seed", (IOptions<TOTPOptions> opts) =>
{
    var hash = Base32.Rfc4648.Encode(ComputeSecretHash(opts));

    return Results.Ok(new SeedResponse { Seed = hash });
})
.WithName("Seed")
.WithDescription("Endpoint for getting timer seed")
.WithOpenApi();

app.MapPost("/auth", (AuthRequest auth, IValidator<AuthRequest> validator, IOptions<TOTPOptions> opts, ILogger<Program> logger) =>
{
    var validationResult = validator.Validate(auth);

    if (!validationResult.IsValid)
    {
        return Results.ValidationProblem(validationResult.ToDictionary());
    }

    var hashBytes = ComputeSecretHash(opts);

    var totp = new Totp(hashBytes);

    var timeStepMatched = 0L;

    var result = totp.VerifyTotp(auth.Code, out timeStepMatched, VerificationWindow.RfcSpecifiedNetworkDelay);

    logger.LogInformation("Provided code: {code}", auth.Code);
    logger.LogInformation("Current code: {currentCode}", totp.ComputeTotp());

    if (!result)
    {
        return Results.Unauthorized();
    }

    return Results.Ok("Authorized");
})
.WithName("Auth")
.WithDescription("Endpoint for posting authentication by 2FA code")
.WithOpenApi();

app.UseCors(applicationOriginPolicy);

app.Run();
