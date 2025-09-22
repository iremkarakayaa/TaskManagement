using Entity;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface ICardRepository
    {
        Task<Card> AddAsync(Card card);
        Task<Card> GetByIdAsync(int id);
        Task<IEnumerable<Card>> GetByListIdAsync(int listId);
        Task UpdateAsync(Card card);
        Task<bool> DeleteAsync(int id);
        Task<BoardList> GetListByCardIdAsync(int cardId);
    }
}
