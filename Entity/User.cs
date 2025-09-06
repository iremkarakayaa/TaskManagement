using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Entity
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        public ICollection<Board> Boards { get; set; } = new List<Board>();
        public ICollection<Card> AssignedCards { get; set; } = new List<Card>();

    }
}
