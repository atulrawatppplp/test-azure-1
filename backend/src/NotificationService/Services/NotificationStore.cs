using System.Collections.Concurrent;
using MiniOrderManagement.NotificationService.Models;

namespace MiniOrderManagement.NotificationService.Services;

public interface INotificationStore
{
    IReadOnlyCollection<Notification> GetAll();
    Notification Add(string title, string message, string type);
    bool MarkAsRead(Guid notificationId);
    int MarkAllAsRead();
}

/// <summary>
/// Notifications are short-lived, so they live in memory here; swap for Azure Table
/// Storage or Cosmos DB when durability is required.
/// </summary>
public class InMemoryNotificationStore : INotificationStore
{
    private readonly ConcurrentDictionary<Guid, Notification> _notifications = new();

    public InMemoryNotificationStore()
    {
        Add("Welcome to Mini OMS", "Order events published to Service Bus appear here.", "info");
    }

    public IReadOnlyCollection<Notification> GetAll() =>
        _notifications.Values.OrderByDescending(notification => notification.CreatedDate).ToList();

    public Notification Add(string title, string message, string type)
    {
        var notification = new Notification { Title = title, Message = message, Type = type };
        _notifications[notification.NotificationId] = notification;
        return notification;
    }

    public bool MarkAsRead(Guid notificationId)
    {
        if (!_notifications.TryGetValue(notificationId, out var notification))
        {
            return false;
        }

        notification.IsRead = true;
        return true;
    }

    public int MarkAllAsRead()
    {
        var count = 0;
        foreach (var notification in _notifications.Values.Where(candidate => !candidate.IsRead))
        {
            notification.IsRead = true;
            count++;
        }

        return count;
    }
}
