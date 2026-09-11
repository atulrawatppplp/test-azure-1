using MiniOrderManagement.AuthService.Models;

namespace MiniOrderManagement.AuthService.Data;

public static class SeedData
{
    public static readonly User DemoUser = new()
    {
        UserId = "USR-1",
        Name = "Aarav Sharma",
        Email = "admin@minioms.com",
        Role = "Admin",
        Phone = "+91 98200 11223",
        Company = "Mini OMS Pvt Ltd"
    };

    public static void Initialize(AuthDbContext context)
    {
        if (!context.Users.Any())
        {
            context.Users.Add(DemoUser);
            context.SaveChanges();
        }
    }
}
