using Microsoft.AspNetCore.Mvc;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;

namespace UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly TaskManagementDbContext _context;

        public UsersController(TaskManagementDbContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _context.Users
                    .Where(u => u.IsActive)
                    .Select(u => new
                    {
                        u.Id,
                        u.Username,
                        u.Email,
                        u.CreatedAt
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting users: {ex.Message}");
                return StatusCode(500, new { message = "Kullanıcılar yüklenirken bir hata oluştu", error = ex.Message });
            }
        }

        // GET: api/users/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.Id == id && u.IsActive)
                    .Select(u => new
                    {
                        u.Id,
                        u.Username,
                        u.Email,
                        u.CreatedAt,
                        u.LastLoginAt
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                    return NotFound();

                return Ok(user);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user: {ex.Message}");
                return StatusCode(500, new { message = "Kullanıcı yüklenirken bir hata oluştu", error = ex.Message });
            }
        }
    }
}
