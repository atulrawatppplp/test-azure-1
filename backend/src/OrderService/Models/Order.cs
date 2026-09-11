using System.ComponentModel.DataAnnotations;

namespace MiniOrderManagement.OrderService.Models;

public enum OrderStatus
{
    Pending,
    Processing,
    Completed,
    Cancelled,
}

public enum PaymentStatus
{
    Unpaid,
    Paid,
    Refunded,
}

public class Order
{
    public Guid OrderId { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    public string CustomerId { get; set; } = string.Empty;

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    public decimal TotalAmount { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public List<OrderItem> Items { get; set; } = [];
}

public class OrderItem
{
    public Guid OrderItemId { get; set; } = Guid.NewGuid();

    public Guid OrderId { get; set; }

    public Guid ProductId { get; set; }

    [MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal Price { get; set; }
}
