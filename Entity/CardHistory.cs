using System.ComponentModel.DataAnnotations;

namespace Entity
{
    public class CardHistory
    {
        public int Id { get; set; }
        
        [Required]
        public int CardId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Action { get; set; } = string.Empty; // "created", "updated", "moved", "assigned", etc.
        
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string OldValue { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string NewValue { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public Card Card { get; set; }
        public User User { get; set; }
    }
}
