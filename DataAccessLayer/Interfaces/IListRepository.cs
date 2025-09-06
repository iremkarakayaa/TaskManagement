using Entity;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface IListRepository
    {
        Task<BoardList> AddAsync(BoardList list);
        Task<BoardList> GetByIdAsync(int id);
        Task<IEnumerable<BoardList>> GetByBoardIdAsync(int boardId);
        Task UpdateAsync(BoardList list);
        Task<bool> DeleteAsync(int id);
    }
}
