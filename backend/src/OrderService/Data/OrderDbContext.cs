using Microsoft.EntityFrameworkCore;
using MiniOrderManagement.OrderService.Models;

namespace MiniOrderManagement.OrderService.Data;

public class OrderDbContext(DbContextOptions<OrderDbContext> options) : DbContext(options)
{
    public DbSet<Order> Orders => Set<Order>();

    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("Orders");
            entity.HasKey(order => order.OrderId);
            entity.Property(order => order.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(order => order.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(order => order.PaymentStatus).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(order => order.Status);
            entity.HasIndex(order => order.CustomerId);
            entity.HasMany(order => order.Items)
                .WithOne()
                .HasForeignKey(item => item.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.ToTable("OrderItems");
            entity.HasKey(item => item.OrderItemId);
            entity.Property(item => item.Price).HasColumnType("decimal(18,2)");
            entity.HasIndex(item => item.OrderId);
            entity.HasIndex(item => item.ProductId);
        });
    }
}
