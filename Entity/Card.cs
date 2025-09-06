using System;

namespace Entity
{
    public class Card
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; } = false;

        public int ListId { get; set; }
        public int? AssignedUserId { get; set; } // Opsiyonel atama

        // Navigation Properties
        public BoardList List { get; set; }
        public User AssignedUser { get; set; }
    }
}
