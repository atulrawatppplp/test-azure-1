using Microsoft.EntityFrameworkCore;
using MiniOrderManagement.AuthService.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("AuthDb");
builder.Services.AddDbContext<AuthDbContext>(options =>
{
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        options.UseInMemoryDatabase("auth");
    }
    else
    {
        options.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure());
    }
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        scope.ServiceProvider.GetRequiredService<AuthDbContext>().Database.EnsureCreated();
    }
    SeedData.Initialize(scope.ServiceProvider.GetRequiredService<AuthDbContext>());
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "AuthService" }));

app.Run();
