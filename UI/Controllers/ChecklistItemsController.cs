using Microsoft.AspNetCore.Mvc;
using DataAccessLayer;
using Entity;
using Microsoft.EntityFrameworkCore;

namespace UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChecklistItemsController : ControllerBase
    {
        private readonly TaskManagementDbContext _context;

        public ChecklistItemsController(TaskManagementDbContext context)
        {
            _context = context;
        }

        // GET: api/checklistitems/{cardId}
        [HttpGet("{cardId}")]
        public async Task<IActionResult> GetChecklistItems(int cardId)
        {
            try
            {
                var items = await _context.ChecklistItems
                    .Where(ci => ci.CardId == cardId)
                    .Include(ci => ci.AssignedUser)
                    .OrderBy(ci => ci.Order)
                    .Select(ci => new
                    {
                        ci.Id,
                        ci.Text,
                        ci.IsCompleted,
                        ci.DueDate,
                        ci.AssignedUserId,
                        ci.Order,
                        ci.CreatedAt,
                        ci.UpdatedAt,
                        AssignedUser = ci.AssignedUser != null ? new
                        {
                            ci.AssignedUser.Id,
                            ci.AssignedUser.Username,
                            ci.AssignedUser.Email
                        } : null
                    })
                    .ToListAsync();

                return Ok(items);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting checklist items: {ex.Message}");
                return StatusCode(500, new { message = "Kontrol listesi öğeleri yüklenirken bir hata oluştu", error = ex.Message });
            }
        }

        // POST: api/checklistitems
        [HttpPost]
        public async Task<IActionResult> CreateChecklistItem([FromBody] CreateChecklistItemRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Text))
                    return BadRequest(new { message = "Kontrol listesi öğesi metni gerekli" });

                var maxOrder = await _context.ChecklistItems
                    .Where(ci => ci.CardId == request.CardId)
                    .MaxAsync(ci => (int?)ci.Order) ?? 0;

                var item = new ChecklistItem
                {
                    CardId = request.CardId,
                    Text = request.Text.Trim(),
                    IsCompleted = false,
                    DueDate = request.DueDate,
                    AssignedUserId = request.AssignedUserId,
                    Order = maxOrder + 1,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ChecklistItems.Add(item);
                await _context.SaveChangesAsync();

                // Geçmiş kaydı ekle
                var historyEntry = new CardHistory
                {
                    CardId = request.CardId,
                    UserId = 1, // Şimdilik sabit, gerçek kullanıcı ID'si kullanılacak
                    Action = "checklist_item_added",
                    Description = "Kontrol listesi öğesi eklendi",
                    NewValue = request.Text.Trim(),
                    CreatedAt = DateTime.UtcNow
                };
                _context.CardHistory.Add(historyEntry);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetChecklistItems), new { cardId = request.CardId }, item);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating checklist item: {ex.Message}");
                return StatusCode(500, new { message = "Kontrol listesi öğesi oluşturulurken bir hata oluştu", error = ex.Message });
            }
        }

        // PUT: api/checklistitems/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateChecklistItem(int id, [FromBody] UpdateChecklistItemRequest request)
        {
            try
            {
                var item = await _context.ChecklistItems.FindAsync(id);
                if (item == null)
                    return NotFound(new { message = "Kontrol listesi öğesi bulunamadı" });

                var oldText = item.Text;
                var oldCompleted = item.IsCompleted;
                var oldAssignedUserId = item.AssignedUserId;

                item.Text = request.Text?.Trim() ?? item.Text;
                item.IsCompleted = request.IsCompleted ?? item.IsCompleted;
                item.DueDate = request.DueDate ?? item.DueDate;
                item.AssignedUserId = request.AssignedUserId ?? item.AssignedUserId;
                item.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Geçmiş kaydı ekle
                var historyEntries = new List<CardHistory>();

                if (oldText != item.Text)
                {
                    historyEntries.Add(new CardHistory
                    {
                        CardId = item.CardId,
                        UserId = 1, // Şimdilik sabit
                        Action = "checklist_item_updated",
                        Description = "Kontrol listesi öğesi güncellendi",
                        OldValue = oldText,
                        NewValue = item.Text,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                if (oldCompleted != item.IsCompleted)
                {
                    historyEntries.Add(new CardHistory
                    {
                        CardId = item.CardId,
                        UserId = 1, // Şimdilik sabit
                        Action = "checklist_item_completed",
                        Description = item.IsCompleted ? "Kontrol listesi öğesi tamamlandı" : "Kontrol listesi öğesi tamamlanmadı olarak işaretlendi",
                        OldValue = oldCompleted.ToString(),
                        NewValue = item.IsCompleted.ToString(),
                        CreatedAt = DateTime.UtcNow
                    });
                }

                if (historyEntries.Any())
                {
                    _context.CardHistory.AddRange(historyEntries);
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Kontrol listesi öğesi güncellendi" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating checklist item: {ex.Message}");
                return StatusCode(500, new { message = "Kontrol listesi öğesi güncellenirken bir hata oluştu", error = ex.Message });
            }
        }

        // DELETE: api/checklistitems/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChecklistItem(int id)
        {
            try
            {
                var item = await _context.ChecklistItems.FindAsync(id);
                if (item == null)
                    return NotFound(new { message = "Kontrol listesi öğesi bulunamadı" });

                var cardId = item.CardId;
                var itemText = item.Text;

                _context.ChecklistItems.Remove(item);
                await _context.SaveChangesAsync();

                // Geçmiş kaydı ekle
                var historyEntry = new CardHistory
                {
                    CardId = cardId,
                    UserId = 1, // Şimdilik sabit
                    Action = "checklist_item_deleted",
                    Description = "Kontrol listesi öğesi silindi",
                    OldValue = itemText,
                    CreatedAt = DateTime.UtcNow
                };
                _context.CardHistory.Add(historyEntry);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Kontrol listesi öğesi silindi" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting checklist item: {ex.Message}");
                return StatusCode(500, new { message = "Kontrol listesi öğesi silinirken bir hata oluştu", error = ex.Message });
            }
        }
    }

    public class CreateChecklistItemRequest
    {
        public int CardId { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public int? AssignedUserId { get; set; }
    }

    public class UpdateChecklistItemRequest
    {
        public string? Text { get; set; }
        public bool? IsCompleted { get; set; }
        public DateTime? DueDate { get; set; }
        public int? AssignedUserId { get; set; }
    }
}
