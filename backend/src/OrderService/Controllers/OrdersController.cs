using Microsoft.AspNetCore.Mvc;
using MiniOrderManagement.OrderService.Models;
using MiniOrderManagement.OrderService.Services;

namespace MiniOrderManagement.OrderService.Controllers;

[ApiController]
[Route("api/orders")]
[Produces("application/json")]
public class OrdersController(IOrderRepository repository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<OrderResponse>>> GetOrders(
        [FromQuery] string? search,
        [FromQuery] OrderStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default) =>
        Ok(await repository.GetAsync(search, status, page, pageSize, cancellationToken));

    [HttpGet("stats")]
    public async Task<ActionResult<OrderStatsResponse>> GetStats(CancellationToken cancellationToken) =>
        Ok(await repository.GetStatsAsync(cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderResponse>> GetOrder(Guid id, CancellationToken cancellationToken)
    {
        var order = await repository.GetByIdAsync(id, cancellationToken);
        return order is null ? Problem($"Order {id} was not found.", statusCode: StatusCodes.Status404NotFound) : Ok(order);
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponse>> CreateOrder(CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var order = await repository.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, order);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<OrderResponse>> UpdateOrder(Guid id, UpdateOrderRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var order = await repository.UpdateAsync(id, request, cancellationToken);
            return order is null ? NotFound() : Ok(order);
        }
        catch (InvalidOperationException exception)
        {
            return Problem(exception.Message, statusCode: StatusCodes.Status409Conflict);
        }
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<OrderResponse>> CancelOrder(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var order = await repository.CancelAsync(id, cancellationToken);
            return order is null ? NotFound() : Ok(order);
        }
        catch (InvalidOperationException exception)
        {
            return Problem(exception.Message, statusCode: StatusCodes.Status409Conflict);
        }
    }
}
