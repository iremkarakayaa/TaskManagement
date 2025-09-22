using DataAccessLayer.Interfaces;
using Entity;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccessLayer.Repository
{
    public class CardRepository : ICardRepository
    {
        private readonly TaskManagementDbContext _context;

        public CardRepository(TaskManagementDbContext context)
        {
            _context = context;
        }

        public async Task<Card> AddAsync(Card card)
        {
            _context.Cards.Add(card);
            await _context.SaveChangesAsync();
            return card;
        }

        public async Task<Card> GetByIdAsync(int id)
        {
            return await _context.Cards
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<IEnumerable<Card>> GetByListIdAsync(int listId)
        {
            return await _context.Cards
                .Where(c => c.ListId == listId)
                .ToListAsync();
        }

        public async Task UpdateAsync(Card card)
        {
            _context.Cards.Update(card);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var card = await _context.Cards.FindAsync(id);
            if (card == null) return false;

            _context.Cards.Remove(card);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BoardList> GetListByCardIdAsync(int cardId)
        {
            var card = await _context.Cards
                .Include(c => c.List)
                .FirstOrDefaultAsync(c => c.Id == cardId);
            
            return card?.List;
        }
    }
}