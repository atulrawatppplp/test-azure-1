using Microsoft.EntityFrameworkCore;
using MiniOrderManagement.OrderService.Data;
using MiniOrderManagement.OrderService.Models;

namespace MiniOrderManagement.OrderService.Services;

public interface IOrderRepository
{
    Task<PagedResult<OrderResponse>> GetAsync(string? search, OrderStatus? status, int page, int pageSize, CancellationToken cancellationToken);
    Task<OrderResponse?> GetByIdAsync(Guid orderId, CancellationToken cancellationToken);
    Task<OrderResponse> CreateAsync(CreateOrderRequest request, CancellationToken cancellationToken);
    Task<OrderResponse?> UpdateAsync(Guid orderId, UpdateOrderRequest request, CancellationToken cancellationToken);
    Task<OrderResponse?> CancelAsync(Guid orderId, CancellationToken cancellationToken);
    Task<OrderStatsResponse> GetStatsAsync(CancellationToken cancellationToken);
}

public class OrderRepository(OrderDbContext context, IOrderEventPublisher publisher) : IOrderRepository
{
    public async Task<PagedResult<OrderResponse>> GetAsync(
        string? search,
        OrderStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

        var query = context.Orders.AsNoTracking().Include(order => order.Items).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(order => order.CustomerName.Contains(search));
        }

        if (status.HasValue)
        {
            query = query.Where(order => order.Status == status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var orders = await query
            .OrderByDescending(order => order.OrderDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<OrderResponse>(orders.Select(ToResponse).ToList(), page, pageSize, totalCount);
    }

    public async Task<OrderResponse?> GetByIdAsync(Guid orderId, CancellationToken cancellationToken)
    {
        var order = await context.Orders.AsNoTracking()
            .Include(candidate => candidate.Items)
            .FirstOrDefaultAsync(candidate => candidate.OrderId == orderId, cancellationToken);
        return order is null ? null : ToResponse(order);
    }

    public async Task<OrderResponse> CreateAsync(CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var order = new Order
        {
            CustomerId = request.CustomerId,
            CustomerName = request.CustomerName,
            Items = request.Items
                .Select(item => new OrderItem
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    Quantity = item.Quantity,
                    Price = item.Price,
                })
                .ToList(),
        };
        order.TotalAmount = order.Items.Sum(item => item.Price * item.Quantity);

        context.Orders.Add(order);
        await context.SaveChangesAsync(cancellationToken);
        await PublishAsync("OrderCreated", order, cancellationToken);
        return ToResponse(order);
    }

    public async Task<OrderResponse?> UpdateAsync(Guid orderId, UpdateOrderRequest request, CancellationToken cancellationToken)
    {
        var order = await Load(orderId, cancellationToken);
        if (order is null)
        {
            return null;
        }

        if (request.Status == OrderStatus.Cancelled)
        {
            return await CancelAsync(orderId, cancellationToken);
        }

        if (order.Status != request.Status && !IsTransitionAllowed(order.Status, request.Status))
        {
            throw new InvalidOperationException($"An order in status {order.Status} cannot move to {request.Status}.");
        }

        order.Status = request.Status;
        order.PaymentStatus = request.PaymentStatus
            ?? (request.Status == OrderStatus.Completed ? PaymentStatus.Paid : order.PaymentStatus);

        await context.SaveChangesAsync(cancellationToken);
        await PublishAsync("OrderStatusChanged", order, cancellationToken);
        return ToResponse(order);
    }

    public async Task<OrderResponse?> CancelAsync(Guid orderId, CancellationToken cancellationToken)
    {
        var order = await Load(orderId, cancellationToken);
        if (order is null)
        {
            return null;
        }

        if (order.Status == OrderStatus.Completed)
        {
            throw new InvalidOperationException("A completed order cannot be cancelled.");
        }

        order.Status = OrderStatus.Cancelled;
        order.PaymentStatus = order.PaymentStatus == PaymentStatus.Paid ? PaymentStatus.Refunded : PaymentStatus.Unpaid;

        await context.SaveChangesAsync(cancellationToken);
        await PublishAsync("OrderCancelled", order, cancellationToken);
        return ToResponse(order);
    }

    public async Task<OrderStatsResponse> GetStatsAsync(CancellationToken cancellationToken)
    {
        var orders = await context.Orders.AsNoTracking()
            .Select(order => new { order.Status, order.TotalAmount })
            .ToListAsync(cancellationToken);

        return new OrderStatsResponse(
            orders.Count,
            orders.Count(order => order.Status == OrderStatus.Pending),
            orders.Count(order => order.Status == OrderStatus.Processing),
            orders.Count(order => order.Status == OrderStatus.Completed),
            orders.Count(order => order.Status == OrderStatus.Cancelled),
            orders.Where(order => order.Status != OrderStatus.Cancelled).Sum(order => order.TotalAmount));
    }

    private static bool IsTransitionAllowed(OrderStatus current, OrderStatus next) => current switch
    {
        OrderStatus.Pending => next is OrderStatus.Processing or OrderStatus.Completed or OrderStatus.Cancelled,
        OrderStatus.Processing => next is OrderStatus.Completed or OrderStatus.Cancelled,
        _ => false,
    };

    private Task<Order?> Load(Guid orderId, CancellationToken cancellationToken) =>
        context.Orders.Include(order => order.Items).FirstOrDefaultAsync(order => order.OrderId == orderId, cancellationToken);

    private Task PublishAsync(string eventType, Order order, CancellationToken cancellationToken) =>
        publisher.PublishAsync(
            new OrderEvent(eventType, order.OrderId, order.CustomerName, order.TotalAmount, order.Status.ToString(), DateTime.UtcNow),
            cancellationToken);

    private static OrderResponse ToResponse(Order order) => new(
        order.OrderId,
        order.CustomerId,
        order.CustomerName,
        order.OrderDate,
        order.TotalAmount,
        order.Status.ToString(),
        order.PaymentStatus.ToString(),
        order.CreatedDate,
        order.Items
            .Select(item => new OrderItemResponse(item.OrderItemId, item.OrderId, item.ProductId, item.ProductName, item.Quantity, item.Price))
            .ToList());
}
