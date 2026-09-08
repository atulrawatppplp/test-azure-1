using System.ComponentModel.DataAnnotations;

namespace MiniOrderManagement.ProductService.Models;

public record ProductResponse(
    Guid ProductId,
    string ProductName,
    string Description,
    decimal Price,
    int Stock,
    string Category,
    bool IsActive,
    DateTime CreatedDate);

public class ProductRequest
{
    [Required]
    [StringLength(200, MinimumLength = 3)]
    public string ProductName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, 1_000_000)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }

    [Required]
    [StringLength(100)]
    public string Category { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}

public record PagedResult<T>(IReadOnlyCollection<T> Items, int Page, int PageSize, int TotalCount);
