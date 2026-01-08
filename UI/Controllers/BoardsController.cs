using Microsoft.AspNetCore.Mvc;
using DataAccessLayer;
using Entity;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace UI.Controllers
{
    public class CreateBoardRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public int OwnerUserId { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class BoardsController : ControllerBase
    {
        private readonly TaskManagementDbContext _context;

        public BoardsController(TaskManagementDbContext context)
        {
            _context = context;
        }

        // Test endpoint
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "Boards API çalışıyor", timestamp = DateTime.UtcNow });
        }

        // GET: api/boards
        [HttpGet]
        public async Task<IActionResult> GetBoards()
        {
            try
            {
                var boards = await _context.Boards
                    .Select(b => new
                    {
                        b.Id,
                        b.Name,
                        b.Description,
                        b.OwnerUserId,
                        b.CreatedAt,
                        Lists = b.Lists.Select(l => new
                        {
                            l.Id,
                            l.Name,
                            l.Order,
                            Cards = l.Cards
                                .OrderBy(c => c.Order)
                                .Select(c => new
                            {
                                c.Id,
                                c.Title,
                                c.Description,
                                c.DueDate,
                                c.IsCompleted,
                                c.Order,
                                c.ListId,
                                c.Checklist,
                                c.AssignedUserId,
                                c.AssignedUserIds
                            }).ToList()
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(boards);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting boards: {ex.Message}");
                return StatusCode(500, new { message = "Panolar yüklenirken bir hata oluştu", error = ex.Message });
            }
        }

        // GET: api/boards/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetBoardsByUser(int userId)
        {
            try
            {
                var boards = await _context.Boards
                    .Where(b => b.OwnerUserId == userId)
                    .Select(b => new
                    {
                        b.Id,
                        b.Name,
                        b.Description,
                        b.OwnerUserId,
                        b.CreatedAt,
                        b.IsArchived
                    })
                    .ToListAsync();

                return Ok(boards);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user boards: {ex.Message}");
                return StatusCode(500, new { message = "Kullanıcı panoları yüklenirken bir hata oluştu", error = ex.Message });
            }
        }

        // GET: api/boards/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBoardById(int id)
        {
            try
            {
                var board = await _context.Boards
                    .Where(b => b.Id == id)
                    .Select(b => new
                    {
                        b.Id,
                        b.Name,
                        b.Description,
                        b.OwnerUserId,
                        b.CreatedAt,
                        Lists = b.Lists.Select(l => new
                        {
                            l.Id,
                            l.Name,
                            l.Order,
                            Cards = l.Cards.Select(c => new
                            {
                                c.Id,
                                c.Title,
                                c.Description,
                                c.DueDate,
                                c.IsCompleted,
                                c.ListId,
                                c.Checklist,
                                c.AssignedUserId,
                                c.AssignedUserIds
                            }).ToList()
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (board == null)
                    return NotFound();

                return Ok(board);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting board: {ex.Message}");
                return StatusCode(500, new { message = "Pano yüklenirken bir hata oluştu", error = ex.Message });
            }
        }

        // POST: api/boards
        [HttpPost]
        public async Task<IActionResult> CreateBoard([FromBody] CreateBoardRequest request)
        {
            try
            {
                Console.WriteLine($"CreateBoard çağrıldı: Name={request?.Name}, OwnerUserId={request?.OwnerUserId}");

                if (request == null)
                    return BadRequest(new { message = "Board verisi gerekli" });

                if (string.IsNullOrWhiteSpace(request.Name))
                    return BadRequest(new { message = "Board adı gerekli" });

                if (request.OwnerUserId == 0)
                    return BadRequest(new { message = "OwnerUserId gerekli" });

                var board = new Board
                {
                    Name = request.Name,
                    Description = request.Description,
                    OwnerUserId = request.OwnerUserId,
                    CreatedAt = DateTime.UtcNow
                };

                Console.WriteLine($"Board ekleniyor: {board.Name}");
                _context.Boards.Add(board);
                
                Console.WriteLine("Database'e kaydediliyor...");
                await _context.SaveChangesAsync();
                Console.WriteLine($"Board başarıyla oluşturuldu: ID={board.Id}");

                return CreatedAtAction(nameof(GetBoardById), new { id = board.Id }, board);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Hata oluştu: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Pano oluşturulurken bir hata oluştu", error = ex.Message, details = ex.InnerException?.Message });
            }
        }

        // PUT: api/boards/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBoard(int id, [FromBody] Board board)
        {
            if (id != board.Id)
                return BadRequest();

            var existingBoard = await _context.Boards.FindAsync(id);
            if (existingBoard == null)
                return NotFound();

            existingBoard.Name = board.Name;
            existingBoard.Description = board.Description;

            _context.Entry(existingBoard).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/boards/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBoard(int id)
        {
            var board = await _context.Boards.FindAsync(id);
            if (board == null)
                return NotFound();

            _context.Boards.Remove(board);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/boards/{id}/archive
        [HttpPut("{id}/archive")]
        public async Task<IActionResult> ArchiveBoard(int id, [FromBody] bool archived)
        {
            try
            {
                var board = await _context.Boards.FindAsync(id);
                if (board == null)
                    return NotFound();

                board.IsArchived = archived;
                await _context.SaveChangesAsync();

                return Ok(new { message = archived ? "Pano arşivlendi" : "Pano arşivden çıkarıldı" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error archiving board: {ex.Message}");
                return StatusCode(500, new { message = "Pano arşivlenirken bir hata oluştu", error = ex.Message });
            }
        }

        // GET: api/boards/{id}/members
        [HttpGet("{id}/members")]
        public async Task<IActionResult> GetBoardMembers(int id)
        {
            try
            {
                var board = await _context.Boards
                    .Include(b => b.OwnerUser)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (board == null)
                    return NotFound(new { message = "Pano bulunamadı" });

                var members = await _context.BoardMembers
                    .Include(bm => bm.User)
                    .Where(bm => bm.BoardId == id && bm.IsActive)
                    .Select(bm => new
                    {
                        UserId = bm.User.Id,
                        Username = bm.User.Username,
                        Email = bm.User.Email,
                        Role = bm.Role.ToString(),
                        IsOwner = false
                    })
                    .ToListAsync();

                // Sahibi listeye ekle (eğer zaten listede değilse)
                if (!members.Any(m => m.UserId == board.OwnerUserId))
                {
                    members.Insert(0, new
                    {
                        UserId = board.OwnerUser.Id,
                        Username = board.OwnerUser.Username,
                        Email = board.OwnerUser.Email,
                        Role = "Owner",
                        IsOwner = true
                    });
                }
                else
                {
                    // Eğer sahibi zaten listedeyse, IsOwner işaretle
                    var ownerInMembers = members.First(m => m.UserId == board.OwnerUserId);
                    // Anonymous types are immutable, so we'd need a different approach if we wanted to "update" it.
                    // But we can just recreate the list or use a DTO.
                }

                // Daha temiz bir liste döndürelim
                var result = members.Select(m => new {
                    m.UserId,
                    m.Username,
                    m.Email,
                    Role = m.UserId == board.OwnerUserId ? "Owner" : m.Role,
                    IsOwner = m.UserId == board.OwnerUserId
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching board members: {ex.Message}");
                return StatusCode(500, new { message = "Pano üyeleri alınırken hata oluştu" });
            }
        }
    }
}
