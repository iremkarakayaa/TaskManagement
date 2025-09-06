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

        // Navigation Properties
        public User OwnerUser { get; set; }
        public ICollection<BoardList> Lists { get; set; } = new List<BoardList>();
    }
}
