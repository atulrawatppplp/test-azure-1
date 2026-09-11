using Microsoft.EntityFrameworkCore;
using MiniOrderManagement.ProductService.Models;

namespace MiniOrderManagement.ProductService.Data;

public class ProductDbContext(DbContextOptions<ProductDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("Products");
            entity.HasKey(product => product.ProductId);
            entity.Property(product => product.Price).HasColumnType("decimal(18,2)");
            entity.HasIndex(product => product.Category);
        });
    }
}
