namespace DataTransferObject.Card
{
    public class CardResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public int ListId { get; set; }
        public int? AssignedUserId { get; set; }
        public List<int> AssignedUserIds { get; set; } = new List<int>();
    }
}
