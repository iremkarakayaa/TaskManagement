using System;
using System.Collections.Generic;

namespace Entity
{
    public class Card
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; } = false;
        public string Labels { get; set; } = "[]"; // JSON string olarak saklanacak
        public string Priority { get; set; } = "medium"; // low, medium, high
        public string Status { get; set; } = "pending"; // pending, in-progress, completed

        public int ListId { get; set; }
        public int? AssignedUserId { get; set; } // Opsiyonel atama
        public string Checklist { get; set; } = "[]"; // JSON string olarak saklanacak
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        public BoardList List { get; set; }
        public User AssignedUser { get; set; }
        public ICollection<CardComment> Comments { get; set; } = new List<CardComment>();
        public ICollection<CardHistory> History { get; set; } = new List<CardHistory>();
        public ICollection<ChecklistItem> ChecklistItems { get; set; } = new List<ChecklistItem>();
    }
}
