using System.ComponentModel.DataAnnotations;

namespace MiniOrderManagement.ProductService.Models;

public class Product
{
    public Guid ProductId { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public int Stock { get; set; }

    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
}
