using System.ComponentModel.DataAnnotations;

namespace Entity
{
    public class CardComment
    {
        public int Id { get; set; }
        
        [Required]
        public int CardId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [StringLength(1000)]
        public string Text { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Navigation Properties
        public Card Card { get; set; }
        public User User { get; set; }
    }
}
