using System.ComponentModel.DataAnnotations;

namespace Entity
{
    public class ChecklistItem
    {
        public int Id { get; set; }
        
        [Required]
        public int CardId { get; set; }
        
        [Required]
        [StringLength(500)]
        public string Text { get; set; } = string.Empty;
        
        public bool IsCompleted { get; set; } = false;
        public DateTime? DueDate { get; set; }
        public int? AssignedUserId { get; set; }
        public int Order { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        public Card Card { get; set; }
        public User AssignedUser { get; set; }
    }
}
