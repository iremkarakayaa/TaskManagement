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
                    Checklist = request.checklist != null ? System.Text.Json.JsonSerializer.Serialize(request.checklist) : "[]"
                };

                Console.WriteLine($"Card ekleniyor: {card.Title}");
                _context.Cards.Add(card);
                
                Console.WriteLine("Database'e kaydediliyor...");
                await _context.SaveChangesAsync();
                Console.WriteLine($"Card başarıyla oluşturuldu: ID={card.Id}");

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
                        AssignedUser = c.AssignedUser != null ? new
                        {
                            c.AssignedUser.Id,
                            c.AssignedUser.Username,
                            c.AssignedUser.Email
                        } : null
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

                existingCard.Title = card.Title;
                existingCard.Description = card.Description;
                existingCard.DueDate = card.DueDate;
                existingCard.IsCompleted = card.IsCompleted;
                existingCard.AssignedUserId = card.AssignedUserId;

                _context.Entry(existingCard).State = EntityState.Modified;
                await _context.SaveChangesAsync();

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
    }

    public class MoveCardRequest
    {
        public int ListId { get; set; }
        public int Order { get; set; }
    }
}
