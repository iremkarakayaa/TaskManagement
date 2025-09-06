using System.ComponentModel.DataAnnotations;

namespace DataLayer.DataTransferObject.User
{
    public class LoginDto
    {
        public string? Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
