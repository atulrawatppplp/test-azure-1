using MiniOrderManagement.ProductService.Models;

namespace MiniOrderManagement.ProductService.Data;

public static class ProductSeeder
{
    public static void Seed(ProductDbContext context)
    {
        if (context.Products.Any())
        {
            return;
        }

        context.Products.AddRange(
            Create(Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), "Wireless Keyboard K380", "Compact multi-device Bluetooth keyboard.", 49.99m, 120, "Peripherals"),
            Create(Guid.Parse("b2c3d4e5-f6a7-8901-bcde-f12345678901"), "27\" 4K Monitor", "IPS panel with USB-C 90W power delivery.", 379.00m, 34, "Displays"),
            Create(Guid.Parse("c3d4e5f6-a7b8-9012-cdef-123456789012"), "USB-C Docking Station", "11-in-1 dock with dual HDMI and ethernet.", 149.50m, 58, "Accessories"),
            Create(Guid.Parse("f6a7b8c9-d0e1-2345-f012-456789012345"), "Noise Cancelling Headset", "Certified headset with dual mic array.", 219.00m, 0, "Audio", false),
            Create(Guid.Parse("d4e5f6a7-b8c9-0123-def0-234567890123"), "Ergonomic Mouse MX", "Vertical grip mouse with 4000 DPI sensor.", 89.99m, 76, "Peripherals"),
            Create(Guid.Parse("e5f6a7b8-c9d0-1234-ef01-345678901234"), "Portable SSD 1TB", "NVMe drive with hardware encryption.", 109.99m, 95, "Storage"));

        context.SaveChanges();
    }

    private static Product Create(Guid productId, string name, string description, decimal price, int stock, string category, bool isActive = true) =>
        new()
        {
            ProductId = productId,
            ProductName = name,
            Description = description,
            Price = price,
            Stock = stock,
            Category = category,
            IsActive = isActive,
        };
}
