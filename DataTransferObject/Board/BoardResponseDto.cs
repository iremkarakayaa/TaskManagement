namespace DataTransferObject.Board
{
    public class BoardResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public int OwnerUserId { get; set; }
    }
}
