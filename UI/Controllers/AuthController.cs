using DataAccessLayer;
using DataLayer.DataTransferObject.User; // RegisterDto ve LoginDto
using Entity; // User entity
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly TaskManagementDbContext _context;

    public AuthController(TaskManagementDbContext context)
    {
        _context = context;
    }

    // -------------------- REGISTER --------------------
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Aynı email kayıtlı mı kontrol et
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == model.Email.ToLower());
        if (existingUser != null)
            return BadRequest(new { message = "Bu email zaten kullanılıyor." });

        // Kullanıcı oluştur
        var user = new User
        {
            Username = model.Username,
            Email = model.Email,
            PasswordHash = HashPassword(model.Password),
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Kayıt başarılı → frontend user objesi döndür
        return Ok(new
        {
            message = "Kayıt başarılı",
            user = new { user.Id, user.Username, user.Email }
        });
    }

    // -------------------- LOGIN --------------------
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == model.Email.ToLower());
        if (user == null)
            return Unauthorized(new { message = "Geçersiz email veya şifre" });

        var passwordHash = HashPassword(model.Password);
        if (user.PasswordHash != passwordHash)
            return Unauthorized(new { message = "Geçersiz email veya şifre" });

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Giriş başarılı",
            token = "fake-jwt-token", // JWT ekleyeceksen buraya
            user = new { user.Id, user.Username, user.Email }
        });
    }

    // -------------------- HELPER: PASSWORD HASH --------------------
    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
