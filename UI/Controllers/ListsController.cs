using Microsoft.AspNetCore.Mvc;
using DataAccessLayer;
using Entity;
using Microsoft.EntityFrameworkCore;

namespace UI.Controllers
{
    public class CreateListRequest
    {
        public int BoardId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Order { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class ListsController : ControllerBase
    {
        private readonly TaskManagementDbContext _context;

        public ListsController(TaskManagementDbContext context)
        {
            _context = context;
        }

        // GET: api/lists/board/{boardId}
        [HttpGet("board/{boardId}")]
        public async Task<IActionResult> GetListsByBoardId(int boardId)
        {
            try
            {
                var lists = await _context.Lists
                    .Where(l => l.BoardId == boardId)
                    .Select(l => new
                    {
                        l.Id,
                        l.Name,
                        l.Order,
                        l.BoardId,
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
                            c.Checklist
                        }).ToList()
                    })
                    .OrderBy(l => l.Order)
                    .ToListAsync();

                return Ok(lists);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting lists: {ex.Message}");
                return StatusCode(500, new { message = "Listeler yüklenirken bir hata oluştu", error = ex.Message });
            }
        }

        // POST: api/lists
        [HttpPost]
        public async Task<IActionResult> CreateList([FromBody] CreateListRequest request)
        {
            try
            {
                Console.WriteLine($"CreateList çağrıldı: BoardId={request?.BoardId}, Name={request?.Name}");

                if (request == null)
                    return BadRequest(new { message = "Liste verisi gerekli" });

                if (string.IsNullOrWhiteSpace(request.Name))
                    return BadRequest(new { message = "Liste adı gerekli" });

                if (request.BoardId == 0)
                    return BadRequest(new { message = "BoardId gerekli" });

                var list = new BoardList
                {
                    Name = request.Name,
                    BoardId = request.BoardId,
                    Order = request.Order
                };

                Console.WriteLine($"List ekleniyor: {list.Name}");
                _context.Lists.Add(list);
                
                Console.WriteLine("Database'e kaydediliyor...");
                await _context.SaveChangesAsync();
                Console.WriteLine($"List başarıyla oluşturuldu: ID={list.Id}");

                return CreatedAtAction(nameof(GetListById), new { id = list.Id }, list);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Hata oluştu: {ex.Message}");
                return StatusCode(500, new { message = "Liste oluşturulurken bir hata oluştu", error = ex.Message });
            }
        }

        // GET: api/lists/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetListById(int id)
        {
            try
            {
                var list = await _context.Lists
                    .Include(l => l.Cards)
                    .FirstOrDefaultAsync(l => l.Id == id);

                if (list == null)
                    return NotFound();

                return Ok(list);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting list: {ex.Message}");
                return StatusCode(500, new { message = "Liste yüklenirken bir hata oluştu", error = ex.Message });
            }
        }

        // PUT: api/lists/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateList(int id, [FromBody] BoardList list)
        {
            try
            {
                if (id != list.Id)
                    return BadRequest();

                var existingList = await _context.Lists.FindAsync(id);
                if (existingList == null)
                    return NotFound();

                existingList.Name = list.Name;
                existingList.Order = list.Order;

                _context.Entry(existingList).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating list: {ex.Message}");
                return StatusCode(500, new { message = "Liste güncellenirken bir hata oluştu", error = ex.Message });
            }
        }

        // DELETE: api/lists/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteList(int id)
        {
            try
            {
                var list = await _context.Lists.FindAsync(id);
                if (list == null)
                    return NotFound();

                _context.Lists.Remove(list);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting list: {ex.Message}");
                return StatusCode(500, new { message = "Liste silinirken bir hata oluştu", error = ex.Message });
            }
        }
    }
}
