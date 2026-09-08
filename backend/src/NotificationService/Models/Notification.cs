namespace MiniOrderManagement.NotificationService.Models;

public class Notification
{
    public Guid NotificationId { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    /// <summary>info | success | warning | error</summary>
    public string Type { get; set; } = "info";

    public bool IsRead { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
}

public record OrderEvent(string EventType, Guid OrderId, string CustomerName, decimal TotalAmount, string Status, DateTime OccurredAt);
