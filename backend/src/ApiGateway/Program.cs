var builder = WebApplication.CreateBuilder(args);

const string frontendCors = "frontend";

builder.Services.AddCors(options =>
{
    options.AddPolicy(frontendCors, policy => policy
        .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"])
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddReverseProxy().LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Entra ID protects the gateway in Azure; wire AddAuthentication().AddMicrosoftIdentityWebApi(...) here.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(frontendCors);
app.MapReverseProxy();
app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "ApiGateway" }));

app.Run();
