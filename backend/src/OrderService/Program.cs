using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using MiniOrderManagement.OrderService.Data;
using MiniOrderManagement.OrderService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();

var connectionString = builder.Configuration.GetConnectionString("OrdersDb");
builder.Services.AddDbContext<OrderDbContext>(options =>
{
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        options.UseInMemoryDatabase("orders");
    }
    else
    {
        options.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure());
    }
});

if (string.IsNullOrWhiteSpace(builder.Configuration["ServiceBus:ConnectionString"]))
{
    builder.Services.AddSingleton<IOrderEventPublisher, LoggingOrderEventPublisher>();
}
else
{
    builder.Services.AddSingleton<IOrderEventPublisher, ServiceBusOrderEventPublisher>();
}

builder.Services.AddScoped<IOrderRepository, OrderRepository>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        scope.ServiceProvider.GetRequiredService<OrderDbContext>().Database.EnsureCreated();
    }
    OrderSeeder.Seed(scope.ServiceProvider.GetRequiredService<OrderDbContext>());
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "OrderService" }));

app.Run();
