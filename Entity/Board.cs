using System;
using System.Collections.Generic;

namespace Entity
{
    public class Board
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OwnerUserId { get; set; }  // Hangi kullanıcıya ait
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsArchived { get; set; } = false;

        // Navigation Properties
        public User OwnerUser { get; set; }
        public ICollection<BoardList> Lists { get; set; } = new List<BoardList>();
        public ICollection<BoardMember> Members { get; set; } = new List<BoardMember>();
        public ICollection<BoardInvitation> Invitations { get; set; } = new List<BoardInvitation>();
    }
}
