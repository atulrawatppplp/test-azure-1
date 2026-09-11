using Microsoft.EntityFrameworkCore;
using MiniOrderManagement.ProductService.Data;
using MiniOrderManagement.ProductService.Models;

namespace MiniOrderManagement.ProductService.Services;

public interface IProductRepository
{
    Task<PagedResult<ProductResponse>> GetAsync(string? search, string? category, bool? isActive, int page, int pageSize, CancellationToken cancellationToken);
    Task<ProductResponse?> GetByIdAsync(Guid productId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<string>> GetCategoriesAsync(CancellationToken cancellationToken);
    Task<ProductResponse> CreateAsync(ProductRequest request, CancellationToken cancellationToken);
    Task<ProductResponse?> UpdateAsync(Guid productId, ProductRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid productId, CancellationToken cancellationToken);
    Task<bool> TryReserveStockAsync(Guid productId, int quantity, CancellationToken cancellationToken);
}

public class ProductRepository(ProductDbContext context) : IProductRepository
{
    public async Task<PagedResult<ProductResponse>> GetAsync(
        string? search,
        string? category,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

        var query = context.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(product => product.ProductName.Contains(search) || product.Category.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(product => product.Category == category);
        }

        if (isActive.HasValue)
        {
            query = query.Where(product => product.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(product => product.CreatedDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(product => ToResponse(product))
            .ToListAsync(cancellationToken);

        return new PagedResult<ProductResponse>(items, page, pageSize, totalCount);
    }

    public async Task<ProductResponse?> GetByIdAsync(Guid productId, CancellationToken cancellationToken)
    {
        var product = await context.Products.AsNoTracking()
            .FirstOrDefaultAsync(candidate => candidate.ProductId == productId, cancellationToken);
        return product is null ? null : ToResponse(product);
    }

    public async Task<IReadOnlyCollection<string>> GetCategoriesAsync(CancellationToken cancellationToken) =>
        await context.Products.AsNoTracking()
            .Select(product => product.Category)
            .Distinct()
            .OrderBy(category => category)
            .ToListAsync(cancellationToken);

    public async Task<ProductResponse> CreateAsync(ProductRequest request, CancellationToken cancellationToken)
    {
        var product = new Product
        {
            ProductName = request.ProductName,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            Category = request.Category,
            IsActive = request.IsActive,
        };

        context.Products.Add(product);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(product);
    }

    public async Task<ProductResponse?> UpdateAsync(Guid productId, ProductRequest request, CancellationToken cancellationToken)
    {
        var product = await context.Products.FirstOrDefaultAsync(candidate => candidate.ProductId == productId, cancellationToken);
        if (product is null)
        {
            return null;
        }

        product.ProductName = request.ProductName;
        product.Description = request.Description;
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.Category = request.Category;
        product.IsActive = request.IsActive;

        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(product);
    }

    public async Task<bool> DeleteAsync(Guid productId, CancellationToken cancellationToken)
    {
        var product = await context.Products.FirstOrDefaultAsync(candidate => candidate.ProductId == productId, cancellationToken);
        if (product is null)
        {
            return false;
        }

        context.Products.Remove(product);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> TryReserveStockAsync(Guid productId, int quantity, CancellationToken cancellationToken)
    {
        var product = await context.Products.FirstOrDefaultAsync(candidate => candidate.ProductId == productId, cancellationToken);
        if (product is null || product.Stock < quantity)
        {
            return false;
        }

        product.Stock -= quantity;
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static ProductResponse ToResponse(Product product) => new(
        product.ProductId,
        product.ProductName,
        product.Description,
        product.Price,
        product.Stock,
        product.Category,
        product.IsActive,
        product.CreatedDate);
}
