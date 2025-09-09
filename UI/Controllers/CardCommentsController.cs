using Microsoft.AspNetCore.Mvc;
using DataAccessLayer;
using Entity;
using Microsoft.EntityFrameworkCore;

namespace UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CardCommentsController : ControllerBase
    {
        private readonly TaskManagementDbContext _context;

        public CardCommentsController(TaskManagementDbContext context)
        {
            _context = context;
        }

        // GET: api/cardcomments/{cardId}
        [HttpGet("{cardId}")]
        public async Task<IActionResult> GetCardComments(int cardId)
        {
            try
            {
                var comments = await _context.CardComments
                    .Where(cc => cc.CardId == cardId && !cc.IsDeleted)
                    .Include(cc => cc.User)
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
                    .ToListAsync();

                return Ok(comments);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting card comments: {ex.Message}");
                return StatusCode(500, new { message = "Kart yorumları yüklenirken bir hata oluştu", error = ex.Message });
            }
        }

        // POST: api/cardcomments
        [HttpPost]
        public async Task<IActionResult> CreateComment([FromBody] CreateCommentRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Text))
                    return BadRequest(new { message = "Yorum metni gerekli" });

                var comment = new CardComment
                {
                    CardId = request.CardId,
                    UserId = request.UserId,
                    Text = request.Text.Trim(),
                    CreatedAt = DateTime.UtcNow
                };

                _context.CardComments.Add(comment);
                await _context.SaveChangesAsync();

                // Yorumu kullanıcı bilgileriyle birlikte döndür
                var createdComment = await _context.CardComments
                    .Where(cc => cc.Id == comment.Id)
                    .Include(cc => cc.User)
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
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(GetCardComments), new { cardId = request.CardId }, createdComment);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating comment: {ex.Message}");
                return StatusCode(500, new { message = "Yorum oluşturulurken bir hata oluştu", error = ex.Message });
            }
        }

        // PUT: api/cardcomments/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentRequest request)
        {
            try
            {
                var comment = await _context.CardComments
                    .FirstOrDefaultAsync(cc => cc.Id == id && !cc.IsDeleted);

                if (comment == null)
                    return NotFound(new { message = "Yorum bulunamadı" });

                if (string.IsNullOrWhiteSpace(request.Text))
                    return BadRequest(new { message = "Yorum metni gerekli" });

                comment.Text = request.Text.Trim();
                comment.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Yorum güncellendi" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating comment: {ex.Message}");
                return StatusCode(500, new { message = "Yorum güncellenirken bir hata oluştu", error = ex.Message });
            }
        }

        // DELETE: api/cardcomments/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            try
            {
                var comment = await _context.CardComments
                    .FirstOrDefaultAsync(cc => cc.Id == id && !cc.IsDeleted);

                if (comment == null)
                    return NotFound(new { message = "Yorum bulunamadı" });

                comment.IsDeleted = true;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Yorum silindi" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting comment: {ex.Message}");
                return StatusCode(500, new { message = "Yorum silinirken bir hata oluştu", error = ex.Message });
            }
        }
    }

    public class CreateCommentRequest
    {
        public int CardId { get; set; }
        public int UserId { get; set; }
        public string Text { get; set; } = string.Empty;
    }

    public class UpdateCommentRequest
    {
        public string Text { get; set; } = string.Empty;
    }
}
