using Microsoft.EntityFrameworkCore;
using MiniOrderManagement.ProductService.Data;
using MiniOrderManagement.ProductService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();

// Azure SQL in every deployed environment; the in-memory provider keeps local F5 working.
var connectionString = builder.Configuration.GetConnectionString("ProductsDb");
builder.Services.AddDbContext<ProductDbContext>(options =>
{
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        options.UseInMemoryDatabase("products");
    }
    else
    {
        options.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure());
    }
});

builder.Services.AddScoped<IProductRepository, ProductRepository>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ProductDbContext>();
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        context.Database.EnsureCreated();
        ProductSeeder.Seed(context);
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "ProductService" }));

app.Run();
