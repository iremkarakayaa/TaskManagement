using DataAccessLayer;
using DataLayer.DataTransferObject.User; 
using Entity; 
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

    // -------------------- REGISTER -------------------
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == model.Email.ToLower());
        if (existingUser != null)
            return BadRequest(new { message = "Bu email zaten kullanılıyor." });

   
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

        // Email veya kullanıcı adı ile giriş yapılabilir
        var user = await _context.Users.FirstOrDefaultAsync(u => 
            u.Email.ToLower() == model.Email.ToLower() || 
            u.Username.ToLower() == model.Email.ToLower());
        
        if (user == null)
            return Unauthorized(new { message = "Geçersiz email/kullanıcı adı veya şifre" });

        var passwordHash = HashPassword(model.Password);
        if (user.PasswordHash != passwordHash)
            return Unauthorized(new { message = "Geçersiz email/kullanıcı adı veya şifre" });

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Giriş başarılı",
            token = "fake-jwt-token", 
            user = new { user.Id, user.Username, user.Email }
        });
    }

    // -------------------- PASSWORD RESET REQUEST --------------------
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == model.Email.ToLower());
        if (user == null)
            return Ok(new { message = "Eğer bu email adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir." });

        // Gerçek uygulamada burada email gönderilir
        // Şimdilik sadece token oluşturuyoruz
        var resetToken = Guid.NewGuid().ToString();
        
        // Reset token'ı veritabanında saklamak için yeni bir tablo gerekebilir
        // Şimdilik basit bir yaklaşım kullanıyoruz
        user.PasswordHash = resetToken; // Geçici olarak token'ı saklıyoruz
        await _context.SaveChangesAsync();

        return Ok(new { message = "Şifre sıfırlama bağlantısı email adresinize gönderildi." });
    }

    // -------------------- PASSWORD RESET --------------------
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Gerçek uygulamada token doğrulaması yapılır
        var user = await _context.Users.FirstOrDefaultAsync(u => u.PasswordHash == model.Token);
        if (user == null)
            return BadRequest(new { message = "Geçersiz veya süresi dolmuş token." });

        user.PasswordHash = HashPassword(model.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Şifreniz başarıyla sıfırlandı." });
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

// -------------------- DTOs --------------------
public class ForgotPasswordDto
{
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
