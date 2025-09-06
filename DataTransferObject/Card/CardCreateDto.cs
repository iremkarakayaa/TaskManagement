namespace DataTransferObject.Card
{
    public class CardCreateDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public int ListId { get; set; }
        public int? AssignedUserId { get; set; } // Opsiyonel
    }
}
