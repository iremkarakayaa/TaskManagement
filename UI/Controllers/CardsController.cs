using Microsoft.AspNetCore.Mvc;
using DataAccessLayer;
using Entity;
using Microsoft.EntityFrameworkCore;

namespace UI.Controllers
{
    public class CreateCardRequest
    {
        public int listId { get; set; }
        public string title { get; set; } = string.Empty;
        public string description { get; set; } = string.Empty;
        public DateTime? dueDate { get; set; }
        public bool isCompleted { get; set; } = false;
        public object checklist { get; set; } = new object(); // JSON olarak saklanacak
        public object labels { get; set; } = new object(); // JSON olarak saklanacak
        public string priority { get; set; } = "medium";
        public string status { get; set; } = "pending";
        public int? assignedUserId { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class CardsController : ControllerBase
    {
        private readonly TaskManagementDbContext _context;

        public CardsController(TaskManagementDbContext context)
        {
            _context = context;
        }

        // POST: api/cards
        [HttpPost]
        public async Task<IActionResult> CreateCard([FromBody] CreateCardRequest request)
        {
            try
            {
                Console.WriteLine($"CreateCard çağrıldı: ListId={request?.listId}, Title={request?.title}");
                Console.WriteLine($"Request data: {System.Text.Json.JsonSerializer.Serialize(request)}");
                Console.WriteLine($"Request type: {request?.GetType()}");

                if (request == null)
                {
                    Console.WriteLine("Request is null");
                    return BadRequest(new { message = "Kart verisi gerekli" });
                }

                if (string.IsNullOrWhiteSpace(request.title))
                {
                    Console.WriteLine("Title is empty");
                    return BadRequest(new { message = "Kart başlığı gerekli" });
                }

                if (request.listId == 0)
                {
                    Console.WriteLine("ListId is 0");
                    return BadRequest(new { message = "ListId gerekli" });
                }

                var card = new Card
                {
                    Title = request.title,
                    Description = request.description,
                    ListId = request.listId,
                    DueDate = request.dueDate,
                    IsCompleted = request.isCompleted,
                    Checklist = request.checklist != null ? System.Text.Json.JsonSerializer.Serialize(request.checklist) : "[]",
                    Labels = request.labels != null ? System.Text.Json.JsonSerializer.Serialize(request.labels) : "[]",
                    Priority = request.priority,
                    Status = request.status,
                    AssignedUserId = request.assignedUserId,
                    CreatedAt = DateTime.UtcNow
                };

                Console.WriteLine($"Card ekleniyor: {card.Title}");
                _context.Cards.Add(card);
                
                Console.WriteLine("Database'e kaydediliyor...");
                await _context.SaveChangesAsync();
                Console.WriteLine($"Card başarıyla oluşturuldu: ID={card.Id}");

                // Kart oluşturma geçmişi ekle
                var historyEntry = new CardHistory
                {
                    CardId = card.Id,
                    UserId = 1, // Şimdilik sabit, gerçek kullanıcı ID'si kullanılacak
                    Action = "created",
                    Description = "Kart oluşturuldu",
                    CreatedAt = DateTime.UtcNow
                };
                _context.CardHistory.Add(historyEntry);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetCardById), new { id = card.Id }, card);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Hata oluştu: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = "Kart oluşturulurken bir hata oluştu", error = ex.Message, details = ex.InnerException?.Message });
            }
        }

        // GET: api/cards/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCardById(int id)
        {
            try
            {
                var card = await _context.Cards
                    .Where(c => c.Id == id)
                    .Select(c => new
                    {
                        c.Id,
                        c.Title,
                        c.Description,
                        c.DueDate,
                        c.IsCompleted,
                        c.ListId,
                        c.AssignedUserId,
                        c.Checklist,
                        c.Labels,
                        c.Priority,
                        c.Status,
                        c.CreatedAt,
                        c.UpdatedAt,
                        List = new
                        {
                            c.List.Id,
                            c.List.Name,
                            c.List.BoardId,
                            Board = new
                            {
                                c.List.Board.Id,
                                c.List.Board.Name
                            }
                        },
                        AssignedUser = c.AssignedUser != null ? new
                        {
                            c.AssignedUser.Id,
                            c.AssignedUser.Username,
                            c.AssignedUser.Email
                        } : null,
                        Comments = c.Comments
                            .Where(cc => !cc.IsDeleted)
                            .OrderBy(cc => cc.CreatedAt)
                            .Select(cc => new
                            {
                                cc.Id,
                                cc.Text,
                                cc.CreatedAt,
                                cc.UpdatedAt,
                                User = new
                                {
                                    cc.User.Id,
                                    cc.User.Username,
                                    cc.User.Email
                                }
                            })
                            .ToList(),
                        History = c.History
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
                            .ToList()
                    })
                    .FirstOrDefaultAsync();

                if (card == null)
                    return NotFound();

                return Ok(card);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting card: {ex.Message}");
                return StatusCode(500, new { message = "Kart yüklenirken bir hata oluştu", error = ex.Message });
            }
        }

        // PUT: api/cards/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCard(int id, [FromBody] Card card)
        {
            try
            {
                if (id != card.Id)
                    return BadRequest();

                var existingCard = await _context.Cards.FindAsync(id);
                if (existingCard == null)
                    return NotFound();

                // Geçmiş kaydı için eski değerleri sakla
                var oldTitle = existingCard.Title;
                var oldDescription = existingCard.Description;
                var oldAssignedUserId = existingCard.AssignedUserId;

                existingCard.Title = card.Title;
                existingCard.Description = card.Description;
                existingCard.DueDate = card.DueDate;
                existingCard.IsCompleted = card.IsCompleted;
                existingCard.AssignedUserId = card.AssignedUserId;
                existingCard.Labels = card.Labels;
                existingCard.Priority = card.Priority;
                existingCard.Status = card.Status;
                existingCard.Checklist = card.Checklist;
                existingCard.UpdatedAt = DateTime.UtcNow;

                _context.Entry(existingCard).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                // Geçmiş kaydı ekle
                var historyEntries = new List<CardHistory>();

                if (oldTitle != card.Title)
                {
                    historyEntries.Add(new CardHistory
                    {
                        CardId = id,
                        UserId = 1, // Şimdilik sabit, gerçek kullanıcı ID'si kullanılacak
                        Action = "updated",
                        Description = "Kart başlığı güncellendi",
                        OldValue = oldTitle,
                        NewValue = card.Title,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                if (oldAssignedUserId != card.AssignedUserId)
                {
                    var oldUser = oldAssignedUserId.HasValue ? 
                        await _context.Users.FindAsync(oldAssignedUserId.Value) : null;
                    var newUser = card.AssignedUserId.HasValue ? 
                        await _context.Users.FindAsync(card.AssignedUserId.Value) : null;

                    historyEntries.Add(new CardHistory
                    {
                        CardId = id,
                        UserId = 1, // Şimdilik sabit, gerçek kullanıcı ID'si kullanılacak
                        Action = "assigned",
                        Description = "Kart ataması değiştirildi",
                        OldValue = oldUser?.Username ?? "Atanmamış",
                        NewValue = newUser?.Username ?? "Atanmamış",
                        CreatedAt = DateTime.UtcNow
                    });
                }

                if (historyEntries.Any())
                {
                    _context.CardHistory.AddRange(historyEntries);
                    await _context.SaveChangesAsync();
                }

                return Ok(existingCard);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating card: {ex.Message}");
                return StatusCode(500, new { message = "Kart güncellenirken bir hata oluştu", error = ex.Message });
            }
        }

        // DELETE: api/cards/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCard(int id)
        {
            try
            {
                var card = await _context.Cards.FindAsync(id);
                if (card == null)
                    return NotFound();

                _context.Cards.Remove(card);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting card: {ex.Message}");
                return StatusCode(500, new { message = "Kart silinirken bir hata oluştu", error = ex.Message });
            }
        }

        // PUT: api/cards/{id}/move
        [HttpPut("{id}/move")]
        public async Task<IActionResult> MoveCard(int id, [FromBody] MoveCardRequest request)
        {
            try
            {
                var card = await _context.Cards.FindAsync(id);
                if (card == null)
                    return NotFound();

                card.ListId = request.ListId;
                _context.Entry(card).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return Ok(card);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error moving card: {ex.Message}");
                return StatusCode(500, new { message = "Kart taşınırken bir hata oluştu", error = ex.Message });
            }
        }

        // PUT: api/cards/{id}/assign
        [HttpPut("{id}/assign")]
        public async Task<IActionResult> AssignCard(int id, [FromBody] AssignCardRequest request)
        {
            try
            {
                var card = await _context.Cards
                    .Include(c => c.List)
                    .ThenInclude(l => l.Board)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (card == null)
                {
                    return NotFound(new { message = "Kart bulunamadı" });
                }

                // Eski atanan kullanıcı varsa bildirim gönder
                if (card.AssignedUserId.HasValue && card.AssignedUserId.Value != request.userId)
                {
                    var oldNotification = new Notification
                    {
                        UserId = card.AssignedUserId.Value,
                        Title = "Kart Ataması Kaldırıldı",
                        Message = $"'{card.Title}' kartından atamanız kaldırıldı. Pano: {card.List.Board.Name}",
                        Type = NotificationType.CardAssigned,
                        BoardId = card.List.BoardId,
                        CardId = card.Id
                    };
                    _context.Notifications.Add(oldNotification);
                }

                // Kartı yeni kullanıcıya ata
                card.AssignedUserId = request.userId;
                card.UpdatedAt = DateTime.UtcNow;

                // Yeni atanan kullanıcıya bildirim gönder
                var newNotification = new Notification
                {
                    UserId = request.userId,
                    Title = "Karta Atandınız",
                    Message = $"'{card.Title}' kartına atandınız. Pano: {card.List.Board.Name}",
                    Type = NotificationType.CardAssigned,
                    BoardId = card.List.BoardId,
                    CardId = card.Id
                };
                _context.Notifications.Add(newNotification);

                await _context.SaveChangesAsync();

                return Ok(new { message = "Kart başarıyla atandı" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"AssignCard error: {ex.Message}");
                return StatusCode(500, new { message = "Kart atanırken hata oluştu" });
            }
        }

        // PUT: api/cards/{id}/unassign
        [HttpPut("{id}/unassign")]
        public async Task<IActionResult> UnassignCard(int id, [FromBody] UnassignCardRequest request)
        {
            try
            {
                var card = await _context.Cards
                    .Include(c => c.List)
                    .ThenInclude(l => l.Board)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (card == null)
                {
                    return NotFound(new { message = "Kart bulunamadı" });
                }

                if (!card.AssignedUserId.HasValue)
                {
                    return BadRequest(new { message = "Bu kart zaten atanmamış" });
                }

                var assignedUserId = card.AssignedUserId.Value;

                // Kart atamasını kaldır
                card.AssignedUserId = null;
                card.UpdatedAt = DateTime.UtcNow;

                // Atanan kullanıcıya bildirim gönder
                var notification = new Notification
                {
                    UserId = assignedUserId,
                    Title = "Kart Ataması Kaldırıldı",
                    Message = $"'{card.Title}' kartından atamanız kaldırıldı. Pano: {card.List.Board.Name}",
                    Type = NotificationType.CardAssigned,
                    BoardId = card.List.BoardId,
                    CardId = card.Id
                };
                _context.Notifications.Add(notification);

                await _context.SaveChangesAsync();

                return Ok(new { message = "Kart ataması başarıyla kaldırıldı" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"UnassignCard error: {ex.Message}");
                return StatusCode(500, new { message = "Kart ataması kaldırılırken hata oluştu" });
            }
        }
    }

    public class MoveCardRequest
    {
        public int ListId { get; set; }
        public int Order { get; set; }
    }

    public class AssignCardRequest
    {
        public int userId { get; set; }
        public int assignedByUserId { get; set; }
    }

    public class UnassignCardRequest
    {
        public int unassignedByUserId { get; set; }
    }
}
