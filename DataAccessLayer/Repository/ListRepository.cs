using DataAccessLayer.Interfaces;
using Entity;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccessLayer.Repository
{
    public class ListRepository : IListRepository
    {
        private readonly TaskManagementDbContext _context;

        public ListRepository(TaskManagementDbContext context)
        {
            _context = context;
        }

        public async Task<BoardList> AddAsync(BoardList list)
        {
            await _context.Lists.AddAsync(list);
            await _context.SaveChangesAsync();
            return list;
        }

        public async Task<BoardList> GetByIdAsync(int id)
        {
            return await _context.Lists.FirstOrDefaultAsync(l => l.Id == id);
        }

        public async Task<IEnumerable<BoardList>> GetByBoardIdAsync(int boardId)
        {
            return await _context.Lists
                                 .Where(l => l.BoardId == boardId)
                                 .ToListAsync();
        }

        public async Task UpdateAsync(BoardList list)
        {
            _context.Lists.Update(list);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var list = await _context.Lists.FindAsync(id);
            if (list == null)
                return false;

            _context.Lists.Remove(list);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
