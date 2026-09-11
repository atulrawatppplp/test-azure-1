using System.Text.Json;
using Azure.Messaging.ServiceBus;
using MiniOrderManagement.NotificationService.Models;

namespace MiniOrderManagement.NotificationService.Services;

/// <summary>
/// Consumes order events from Azure Service Bus and turns them into notifications.
/// Registered only when ServiceBus:ConnectionString is configured.
/// </summary>
public class OrderEventListener(
    IConfiguration configuration,
    INotificationStore store,
    ILogger<OrderEventListener> logger) : BackgroundService
{
    private ServiceBusClient? _client;
    private ServiceBusProcessor? _processor;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _client = new ServiceBusClient(configuration["ServiceBus:ConnectionString"]);
        _processor = _client.CreateProcessor(
            configuration["ServiceBus:OrderTopic"] ?? "order-events",
            configuration["ServiceBus:Subscription"] ?? "notifications");

        _processor.ProcessMessageAsync += async args =>
        {
            var orderEvent = JsonSerializer.Deserialize<OrderEvent>(args.Message.Body.ToString());
            if (orderEvent is not null)
            {
                store.Add(
                    $"Order {orderEvent.OrderId} is {orderEvent.Status.ToLowerInvariant()}",
                    $"{orderEvent.CustomerName} · {orderEvent.TotalAmount:C}",
                    orderEvent.EventType == "OrderCancelled" ? "error" : "info");
            }

            await args.CompleteMessageAsync(args.Message, stoppingToken);
        };

        _processor.ProcessErrorAsync += args =>
        {
            logger.LogError(args.Exception, "Service Bus processing failed for {EntityPath}", args.EntityPath);
            return Task.CompletedTask;
        };

        await _processor.StartProcessingAsync(stoppingToken);
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        if (_processor is not null)
        {
            await _processor.StopProcessingAsync(cancellationToken);
            await _processor.DisposeAsync();
        }

        if (_client is not null)
        {
            await _client.DisposeAsync();
        }

        await base.StopAsync(cancellationToken);
    }
}
