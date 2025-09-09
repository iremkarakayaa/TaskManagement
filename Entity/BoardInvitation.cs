using System.ComponentModel.DataAnnotations;

namespace Entity
{
    public class BoardInvitation
    {
        public int Id { get; set; }
        
        [Required]
        public int BoardId { get; set; }
        
        [Required]
        public int InvitedUserId { get; set; }
        
        [Required]
        public int InvitedByUserId { get; set; }
        
        [Required]
        public BoardRole Role { get; set; } = BoardRole.Viewer;
        
        public InvitationStatus Status { get; set; } = InvitationStatus.Pending;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? RespondedAt { get; set; }
        public string Message { get; set; } = string.Empty;

        // Navigation Properties
        public Board Board { get; set; }
        public User InvitedUser { get; set; }
        public User InvitedByUser { get; set; }
    }

    public enum InvitationStatus
    {
        Pending = 0,
        Accepted = 1,
        Declined = 2,
        Expired = 3
    }
}
