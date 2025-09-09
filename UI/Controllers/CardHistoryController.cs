using Microsoft.AspNetCore.Mvc;
using DataAccessLayer;
using Entity;
using Microsoft.EntityFrameworkCore;

namespace UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CardHistoryController : ControllerBase
    {
        private readonly TaskManagementDbContext _context;

        public CardHistoryController(TaskManagementDbContext context)
        {
            _context = context;
        }

        // GET: api/cardhistory/{cardId}
        [HttpGet("{cardId}")]
        public async Task<IActionResult> GetCardHistory(int cardId)
        {
            try
            {
                var history = await _context.CardHistory
                    .Where(ch => ch.CardId == cardId)
                    .Include(ch => ch.User)
                    .OrderByDescending(ch => ch.CreatedAt)
                    .Select(ch => new
                    {
                        ch.Id,
                        ch.Action,
                        ch.Description,
                        ch.OldValue,
                        ch.NewValue,
                        ch.CreatedAt,
                        User = new
                        {
                            ch.User.Id,
                            ch.User.Username,
                            ch.User.Email
                        }
                    })
                    .ToListAsync();

                return Ok(history);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting card history: {ex.Message}");
                return StatusCode(500, new { message = "Kart geçmişi yüklenirken bir hata oluştu", error = ex.Message });
            }
        }

        // POST: api/cardhistory
        [HttpPost]
        public async Task<IActionResult> CreateHistoryEntry([FromBody] CreateHistoryRequest request)
        {
            try
            {
                var historyEntry = new CardHistory
                {
                    CardId = request.CardId,
                    UserId = request.UserId,
                    Action = request.Action,
                    Description = request.Description,
                    OldValue = request.OldValue,
                    NewValue = request.NewValue,
                    CreatedAt = DateTime.UtcNow
                };

                _context.CardHistory.Add(historyEntry);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Geçmiş kaydı oluşturuldu" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating history entry: {ex.Message}");
                return StatusCode(500, new { message = "Geçmiş kaydı oluşturulurken bir hata oluştu", error = ex.Message });
            }
        }
    }

    public class CreateHistoryRequest
    {
        public int CardId { get; set; }
        public int UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string OldValue { get; set; } = string.Empty;
        public string NewValue { get; set; } = string.Empty;
    }
}
