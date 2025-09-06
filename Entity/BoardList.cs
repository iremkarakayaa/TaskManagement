using System.Collections.Generic;

namespace Entity
{
    public class BoardList
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int BoardId { get; set; }
        public int Order { get; set; } // Sıralama için

        // Navigation Properties
        public Board Board { get; set; }
        public ICollection<Card> Cards { get; set; } = new List<Card>();
    }
}
