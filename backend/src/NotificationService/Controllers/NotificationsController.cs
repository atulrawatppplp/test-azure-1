using Microsoft.AspNetCore.Mvc;
using MiniOrderManagement.NotificationService.Models;
using MiniOrderManagement.NotificationService.Services;

namespace MiniOrderManagement.NotificationService.Controllers;

[ApiController]
[Route("api/notifications")]
[Produces("application/json")]
public class NotificationsController(INotificationStore store) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyCollection<Notification>> GetNotifications() => Ok(store.GetAll());

    [HttpPost("{id:guid}/read")]
    public IActionResult MarkAsRead(Guid id) => store.MarkAsRead(id) ? NoContent() : NotFound();

    [HttpPost("read-all")]
    public IActionResult MarkAllAsRead() => Ok(new { updated = store.MarkAllAsRead() });
}
