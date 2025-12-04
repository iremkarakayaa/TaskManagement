using Microsoft.AspNetCore.Mvc;
using DataAccessLayer;
using Entity;
using Microsoft.EntityFrameworkCore;

namespace UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly TaskManagementDbContext _context;

        public NotificationsController(TaskManagementDbContext context)
        {
            _context = context;
        }

        // GET: api/notifications/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserNotifications(int userId, [FromQuery] bool unreadOnly = false)
        {
            try
            {
                var query = _context.Notifications
                    .Include(n => n.Board)
                    .Include(n => n.Card)
                    .Where(n => n.UserId == userId);

                if (unreadOnly)
                {
                    query = query.Where(n => !n.IsRead);
                }

                var notifications = await query
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetUserNotifications error: {ex.Message}");
                return StatusCode(500, new { message = "Bildirimler alınırken hata oluştu" });
            }
        }

        // GET: api/notifications/user/{userId}/count
        [HttpGet("user/{userId}/count")]
        public async Task<IActionResult> GetUnreadNotificationCount(int userId)
        {
            try
            {
                var count = await _context.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead)
                    .CountAsync();

                return Ok(new { count });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetUnreadNotificationCount error: {ex.Message}");
                return StatusCode(500, new { message = "Bildirim sayısı alınırken hata oluştu" });
            }
        }

        // PUT: api/notifications/{id}/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var notification = await _context.Notifications.FindAsync(id);
                if (notification == null)
                {
                    return NotFound(new { message = "Bildirim bulunamadı" });
                }

                if (!notification.IsRead)
                {
                    notification.IsRead = true;
                    notification.ReadAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Bildirim okundu olarak işaretlendi" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MarkAsRead error: {ex.Message}");
                return StatusCode(500, new { message = "Bildirim işaretlenirken hata oluştu" });
            }
        }

        // PUT: api/notifications/user/{userId}/read-all
        [HttpPut("user/{userId}/read-all")]
        public async Task<IActionResult> MarkAllAsRead(int userId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead)
                    .ToListAsync();

                foreach (var notification in notifications)
                {
                    notification.IsRead = true;
                    notification.ReadAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Tüm bildirimler okundu olarak işaretlendi" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MarkAllAsRead error: {ex.Message}");
                return StatusCode(500, new { message = "Bildirimler işaretlenirken hata oluştu" });
            }
        }

        // DELETE: api/notifications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            try
            {
                var notification = await _context.Notifications.FindAsync(id);
                if (notification == null)
                {
                    return NotFound(new { message = "Bildirim bulunamadı" });
                }

                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Bildirim silindi" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DeleteNotification error: {ex.Message}");
                return StatusCode(500, new { message = "Bildirim silinirken hata oluştu" });
            }
        }
    }
}






