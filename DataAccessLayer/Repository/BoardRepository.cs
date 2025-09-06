using DataAccessLayer.Interfaces;
using Entity;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccessLayer.Repository
{
    public class BoardRepository : IBoardRepository
    {
        private readonly TaskManagementDbContext _context;

        public BoardRepository(TaskManagementDbContext context)
        {
            _context = context;
        }

        public async Task<Board> AddAsync(Board board)
        {
            await _context.Boards.AddAsync(board);
            await _context.SaveChangesAsync();
            return board;
        }

        public async Task<Board> GetByIdAsync(int id)
        {
            return await _context.Boards.FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Board>> GetAllByUserIdAsync(int userId)
        {
            return await _context.Boards
                                 .Where(b => b.OwnerUserId == userId)
                                 .ToListAsync();
        }

        public async Task UpdateAsync(Board board)
        {
            _context.Boards.Update(board);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var board = await _context.Boards.FindAsync(id);
            if (board == null)
                return false;

            _context.Boards.Remove(board);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
