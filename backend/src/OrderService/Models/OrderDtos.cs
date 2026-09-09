using System.ComponentModel.DataAnnotations;

namespace MiniOrderManagement.OrderService.Models;

public record OrderItemResponse(Guid OrderItemId, Guid OrderId, Guid ProductId, string ProductName, int Quantity, decimal Price);

public record OrderResponse(
    Guid OrderId,
    string CustomerId,
    DateTime OrderDate,
    decimal TotalAmount,
    string Status,
    string PaymentStatus,
    DateTime CreatedDate,
    IReadOnlyCollection<OrderItemResponse> Items);

public class CreateOrderItemRequest
{
    public Guid ProductId { get; set; }

    [MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    [Range(1, 1000)]
    public int Quantity { get; set; }

    [Range(0.01, 1_000_000)]
    public decimal Price { get; set; }
}

public class CreateOrderRequest
{
    [MaxLength(100)]
    public string CustomerId { get; set; } = "CUST-SELF";

    [MinLength(1)]
    public List<CreateOrderItemRequest> Items { get; set; } = [];
}

public class UpdateOrderRequest
{
    [Required]
    public OrderStatus Status { get; set; }

    public PaymentStatus? PaymentStatus { get; set; }
}

public record OrderStatsResponse(
    int TotalOrders,
    int PendingOrders,
    int ProcessingOrders,
    int CompletedOrders,
    int CancelledOrders,
    decimal Revenue);

public record PagedResult<T>(IReadOnlyCollection<T> Items, int Page, int PageSize, int TotalCount);

/// <summary>Payload published to the Azure Service Bus topic consumed by the Notification Service.</summary>
public record OrderEvent(string EventType, Guid OrderId, string CustomerId, decimal TotalAmount, string Status, DateTime OccurredAt);
