using Entity;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface IBoardRepository
    {
        Task<Board> AddAsync(Board board);
        Task<Board> GetByIdAsync(int id);
        Task<IEnumerable<Board>> GetAllByUserIdAsync(int userId);
        Task UpdateAsync(Board board);
        Task<bool> DeleteAsync(int id);
    }
}
