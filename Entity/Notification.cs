using System;
using System.ComponentModel.DataAnnotations;

namespace Entity
{
    public class Notification
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [StringLength(500)]
        public string Message { get; set; } = string.Empty;
        
        [Required]
        public NotificationType Type { get; set; }
        
        public int? BoardId { get; set; }
        public int? CardId { get; set; }
        
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }

        // Navigation Properties
        public User User { get; set; }
        public Board Board { get; set; }
        public Card Card { get; set; }
    }

    public enum NotificationType
    {
        CardAssigned = 0,        // Karta atandı
        CardUpdated = 1,         // Kart güncellendi
        CardMoved = 2,           // Kart taşındı
        CardCompleted = 3,       // Kart tamamlandı
        BoardInvitation = 4,     // Pano daveti
        CommentAdded = 5,        // Yorum eklendi
        DueDateApproaching = 6   // Son tarih yaklaşıyor
    }
}

