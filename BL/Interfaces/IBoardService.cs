using DataTransferObject.Board;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BL.Interfaces
{
    public interface IBoardService
    {
        Task<BoardResponseDto> CreateBoardAsync(BoardCreateDto dto);
        Task<IEnumerable<BoardResponseDto>> GetBoardsAsync(int userId);
        Task<BoardResponseDto> GetBoardByIdAsync(int boardId);
        Task<bool> UpdateBoardAsync(int boardId, BoardUpdateDto dto);
        Task<bool> DeleteBoardAsync(int boardId);
    }
}
