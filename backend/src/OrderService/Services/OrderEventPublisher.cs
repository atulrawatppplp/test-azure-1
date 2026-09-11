using System.Text.Json;
using Azure.Messaging.ServiceBus;
using MiniOrderManagement.OrderService.Models;

namespace MiniOrderManagement.OrderService.Services;

public interface IOrderEventPublisher
{
    Task PublishAsync(OrderEvent orderEvent, CancellationToken cancellationToken);
}

/// <summary>Publishes to Azure Service Bus; used whenever ServiceBus:ConnectionString is configured.</summary>
public sealed class ServiceBusOrderEventPublisher : IOrderEventPublisher, IAsyncDisposable
{
    private readonly ServiceBusClient _client;
    private readonly ServiceBusSender _sender;

    public ServiceBusOrderEventPublisher(IConfiguration configuration)
    {
        _client = new ServiceBusClient(configuration["ServiceBus:ConnectionString"]);
        _sender = _client.CreateSender(configuration["ServiceBus:OrderTopic"] ?? "order-events");
    }

    public Task PublishAsync(OrderEvent orderEvent, CancellationToken cancellationToken) =>
        _sender.SendMessageAsync(
            new ServiceBusMessage(JsonSerializer.Serialize(orderEvent)) { Subject = orderEvent.EventType },
            cancellationToken);

    public async ValueTask DisposeAsync()
    {
        await _sender.DisposeAsync();
        await _client.DisposeAsync();
    }
}

/// <summary>Local fallback so the service runs without an Azure connection.</summary>
public class LoggingOrderEventPublisher(ILogger<LoggingOrderEventPublisher> logger) : IOrderEventPublisher
{
    public Task PublishAsync(OrderEvent orderEvent, CancellationToken cancellationToken)
    {
        logger.LogInformation("Order event {EventType} for {OrderId} ({Status})", orderEvent.EventType, orderEvent.OrderId, orderEvent.Status);
        return Task.CompletedTask;
    }
}
