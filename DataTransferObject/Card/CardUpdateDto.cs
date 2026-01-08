namespace DataTransferObject.Card
{
    public class CardUpdateDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public string Labels { get; set; }
        public string Checklist { get; set; }
        public int? AssignedUserId { get; set; } // Opsiyonel
        public List<int> AssignedUserIds { get; set; } = new List<int>();
    }
}
