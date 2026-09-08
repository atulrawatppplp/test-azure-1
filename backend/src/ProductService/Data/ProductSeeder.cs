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
            Create("Wireless Keyboard K380", "Compact multi-device Bluetooth keyboard.", 49.99m, 120, "Peripherals"),
            Create("27\" 4K Monitor", "IPS panel with USB-C 90W power delivery.", 379.00m, 34, "Displays"),
            Create("USB-C Docking Station", "11-in-1 dock with dual HDMI and ethernet.", 149.50m, 58, "Accessories"),
            Create("Noise Cancelling Headset", "Certified headset with dual mic array.", 219.00m, 0, "Audio", false),
            Create("Ergonomic Mouse MX", "Vertical grip mouse with 4000 DPI sensor.", 89.99m, 76, "Peripherals"),
            Create("Portable SSD 1TB", "NVMe drive with hardware encryption.", 109.99m, 95, "Storage"));

        context.SaveChanges();
    }

    private static Product Create(string name, string description, decimal price, int stock, string category, bool isActive = true) =>
        new()
        {
            ProductName = name,
            Description = description,
            Price = price,
            Stock = stock,
            Category = category,
            IsActive = isActive,
        };
}
