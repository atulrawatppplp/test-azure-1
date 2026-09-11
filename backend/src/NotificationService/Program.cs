using MiniOrderManagement.NotificationService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();

builder.Services.AddSingleton<INotificationStore, InMemoryNotificationStore>();

if (!string.IsNullOrWhiteSpace(builder.Configuration["ServiceBus:ConnectionString"]))
{
    builder.Services.AddHostedService<OrderEventListener>();
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "NotificationService" }));

app.Run();
