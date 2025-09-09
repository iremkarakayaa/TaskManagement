using Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;


namespace DataAccessLayer
{

        public class TaskManagementDbContext : DbContext
    {
        public TaskManagementDbContext(DbContextOptions<TaskManagementDbContext> options)
            : base(options) { }

        // Mevcut entity�ler
        public DbSet<User> Users { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }

        // Yeni entity�ler
        public DbSet<Board> Boards { get; set; }
        public DbSet<BoardList> Lists { get; set; }
        public DbSet<Card> Cards { get; set; }
        public DbSet<BoardMember> BoardMembers { get; set; }
        public DbSet<CardComment> CardComments { get; set; }
        public DbSet<CardHistory> CardHistory { get; set; }
        public DbSet<ChecklistItem> ChecklistItems { get; set; }
        public DbSet<BoardInvitation> BoardInvitations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User-TaskItem ili�kisi
            modelBuilder.Entity<User>()
                .HasMany(u => u.Tasks)
                .WithOne(t => t.User)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User-Board ili�kisi (1 kullan�c� ? bir�ok board)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Boards)
                .WithOne(b => b.OwnerUser)
                .HasForeignKey(b => b.OwnerUserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Board-List ili�kisi (1 board ? bir�ok list)
            modelBuilder.Entity<Board>()
                .HasMany(b => b.Lists)
                .WithOne(l => l.Board)
                .HasForeignKey(l => l.BoardId)
                .OnDelete(DeleteBehavior.Cascade);

            // List-Card ili�kisi (1 list ? bir�ok card)
            modelBuilder.Entity<BoardList>()
                .HasMany(l => l.Cards)
                .WithOne(c => c.List)
                .HasForeignKey(c => c.ListId)
                .OnDelete(DeleteBehavior.Cascade);

            // Card-AssignedUser ili�kisi (opsiyonel)
            modelBuilder.Entity<Card>()
                .HasOne(c => c.AssignedUser)
                .WithMany(u => u.AssignedCards)
                .HasForeignKey(c => c.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Board-BoardMember ilişkisi
            modelBuilder.Entity<BoardMember>()
                .HasOne(bm => bm.Board)
                .WithMany(b => b.Members)
                .HasForeignKey(bm => bm.BoardId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BoardMember>()
                .HasOne(bm => bm.User)
                .WithMany(u => u.BoardMemberships)
                .HasForeignKey(bm => bm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Card-CardComment ilişkisi
            modelBuilder.Entity<CardComment>()
                .HasOne(cc => cc.Card)
                .WithMany(c => c.Comments)
                .HasForeignKey(cc => cc.CardId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CardComment>()
                .HasOne(cc => cc.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(cc => cc.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Card-CardHistory ilişkisi
            modelBuilder.Entity<CardHistory>()
                .HasOne(ch => ch.Card)
                .WithMany(c => c.History)
                .HasForeignKey(ch => ch.CardId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CardHistory>()
                .HasOne(ch => ch.User)
                .WithMany(u => u.CardHistory)
                .HasForeignKey(ch => ch.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ChecklistItem ilişkileri
            modelBuilder.Entity<ChecklistItem>()
                .HasOne(ci => ci.Card)
                .WithMany(c => c.ChecklistItems)
                .HasForeignKey(ci => ci.CardId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ChecklistItem>()
                .HasOne(ci => ci.AssignedUser)
                .WithMany(u => u.AssignedChecklistItems)
                .HasForeignKey(ci => ci.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull);

            // BoardInvitation ilişkileri
            modelBuilder.Entity<BoardInvitation>()
                .HasOne(bi => bi.Board)
                .WithMany(b => b.Invitations)
                .HasForeignKey(bi => bi.BoardId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BoardInvitation>()
                .HasOne(bi => bi.InvitedUser)
                .WithMany(u => u.ReceivedInvitations)
                .HasForeignKey(bi => bi.InvitedUserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BoardInvitation>()
                .HasOne(bi => bi.InvitedByUser)
                .WithMany(u => u.SentInvitations)
                .HasForeignKey(bi => bi.InvitedByUserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
