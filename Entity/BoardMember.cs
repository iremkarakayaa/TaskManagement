using System.ComponentModel.DataAnnotations;

namespace Entity
{
    public class BoardMember
    {
        public int Id { get; set; }
        
        [Required]
        public int BoardId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public BoardRole Role { get; set; } = BoardRole.Viewer;
        
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        // Navigation Properties
        public Board Board { get; set; }
        public User User { get; set; }
    }

    public enum BoardRole
    {
        Viewer = 0,    // Sadece görüntüleme
        Editor = 1,    // Düzenleme
        Owner = 2      // Sahip
    }
}
