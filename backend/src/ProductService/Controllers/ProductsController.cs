using Microsoft.AspNetCore.Mvc;
using MiniOrderManagement.ProductService.Models;
using MiniOrderManagement.ProductService.Services;

namespace MiniOrderManagement.ProductService.Controllers;

[ApiController]
[Route("api/products")]
[Produces("application/json")]
public class ProductsController(IProductRepository repository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductResponse>>> GetProducts(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default) =>
        Ok(await repository.GetAsync(search, category, isActive, page, pageSize, cancellationToken));

    [HttpGet("categories")]
    public async Task<ActionResult<IReadOnlyCollection<string>>> GetCategories(CancellationToken cancellationToken) =>
        Ok(await repository.GetCategoriesAsync(cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductResponse>> GetProduct(Guid id, CancellationToken cancellationToken)
    {
        var product = await repository.GetByIdAsync(id, cancellationToken);
        return product is null ? Problem($"Product {id} was not found.", statusCode: StatusCodes.Status404NotFound) : Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductResponse>> CreateProduct(ProductRequest request, CancellationToken cancellationToken)
    {
        var product = await repository.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, product);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProductResponse>> UpdateProduct(Guid id, ProductRequest request, CancellationToken cancellationToken)
    {
        var product = await repository.UpdateAsync(id, request, cancellationToken);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken cancellationToken) =>
        await repository.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();

    /// <summary>Called by the Order Service while creating an order.</summary>
    [HttpPost("{id:guid}/reserve")]
    public async Task<IActionResult> ReserveStock(Guid id, [FromQuery] int quantity, CancellationToken cancellationToken) =>
        await repository.TryReserveStockAsync(id, quantity, cancellationToken)
            ? NoContent()
            : Problem($"Insufficient stock for product {id}.", statusCode: StatusCodes.Status409Conflict);
}
