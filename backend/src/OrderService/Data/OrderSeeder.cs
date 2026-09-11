using MiniOrderManagement.OrderService.Models;

namespace MiniOrderManagement.OrderService.Data;

public static class OrderSeeder
{
    public static void Seed(OrderDbContext context)
    {
        if (context.Orders.Any())
        {
            return;
        }

        var customerId = "USR-1";
        var orderDate = DateTime.UtcNow.AddDays(-7);

        context.Orders.AddRange(
            CreateOrder(
                customerId,
                orderDate,
                528.98m,
                OrderStatus.Completed,
                PaymentStatus.Paid,
                [
                    CreateOrderItem(Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), "Wireless Keyboard K380", 2, 49.99m),
                    CreateOrderItem(Guid.Parse("b2c3d4e5-f6a7-8901-bcde-f12345678901"), "27\" 4K Monitor", 1, 379.00m),
                    CreateOrderItem(Guid.Parse("c3d4e5f6-a7b8-9012-cdef-123456789012"), "USB-C Docking Station", 1, 149.50m)
                ]),
            CreateOrder(
                customerId,
                orderDate.AddDays(-3),
                89.99m,
                OrderStatus.Processing,
                PaymentStatus.Paid,
                [
                    CreateOrderItem(Guid.Parse("d4e5f6a7-b8c9-0123-def0-234567890123"), "Ergonomic Mouse MX", 1, 89.99m)
                ]),
            CreateOrder(
                customerId,
                orderDate.AddDays(-1),
                219.98m,
                OrderStatus.Pending,
                PaymentStatus.Unpaid,
                [
                    CreateOrderItem(Guid.Parse("e5f6a7b8-c9d0-1234-ef01-345678901234"), "Portable SSD 1TB", 2, 109.99m)
                ])
        );

        context.SaveChanges();
    }

    private static Order CreateOrder(
        string customerId,
        DateTime orderDate,
        decimal totalAmount,
        OrderStatus status,
        PaymentStatus paymentStatus,
        List<OrderItem> items) =>
        new()
        {
            CustomerId = customerId,
            OrderDate = orderDate,
            TotalAmount = totalAmount,
            Status = status,
            PaymentStatus = paymentStatus,
            CreatedDate = orderDate,
            Items = items
        };

    private static OrderItem CreateOrderItem(Guid productId, string productName, int quantity, decimal price) =>
        new()
        {
            ProductId = productId,
            ProductName = productName,
            Quantity = quantity,
            Price = price
        };
}
