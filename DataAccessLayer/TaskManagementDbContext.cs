using Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;


namespace DataAccessLayer
{

        public class TaskManagementDbContext : DbContext
    {
        public TaskManagementDbContext(DbContextOptions<TaskManagementDbContext> options)
            : base(options) { }

        // Mevcut entity’ler
        public DbSet<User> Users { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }

        // Yeni entity’ler
        public DbSet<Board> Boards { get; set; }
        public DbSet<BoardList> Lists { get; set; }
        public DbSet<Card> Cards { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User-TaskItem iliþkisi
            modelBuilder.Entity<User>()
                .HasMany(u => u.Tasks)
                .WithOne(t => t.User)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User-Board iliþkisi (1 kullanýcý ? birçok board)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Boards)
                .WithOne(b => b.OwnerUser)
                .HasForeignKey(b => b.OwnerUserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Board-List iliþkisi (1 board ? birçok list)
            modelBuilder.Entity<Board>()
                .HasMany(b => b.Lists)
                .WithOne(l => l.Board)
                .HasForeignKey(l => l.BoardId)
                .OnDelete(DeleteBehavior.Cascade);

            // List-Card iliþkisi (1 list ? birçok card)
            modelBuilder.Entity<BoardList>()
                .HasMany(l => l.Cards)
                .WithOne(c => c.List)
                .HasForeignKey(c => c.ListId)
                .OnDelete(DeleteBehavior.Cascade);

            // Card-AssignedUser iliþkisi (opsiyonel)
            modelBuilder.Entity<Card>()
                .HasOne(c => c.AssignedUser)
                .WithMany(u => u.AssignedCards)
                .HasForeignKey(c => c.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
