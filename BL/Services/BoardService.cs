using BL.Interfaces;
using DataAccessLayer.Interfaces;
using DataTransferObject.Board;
using Entity;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BL.Services
{
    public class BoardService : IBoardService
    {
        private readonly IBoardRepository _boardRepository;

        public BoardService(IBoardRepository boardRepository)
        {
            _boardRepository = boardRepository;
        }

        public async Task<BoardResponseDto> CreateBoardAsync(BoardCreateDto dto)
        {
            var board = new Board
            {
                Name = dto.Name,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                OwnerUserId = 1 // şimdilik sabit, login eklenince UserId’den alırsın
            };

            var added = await _boardRepository.AddAsync(board);

            return new BoardResponseDto
            {
                Id = added.Id,
                Name = added.Name,
                Description = added.Description,
                CreatedAt = added.CreatedAt,
                OwnerUserId = added.OwnerUserId
            };
        }

        public async Task<IEnumerable<BoardResponseDto>> GetBoardsAsync(int userId)
        {
            var boards = await _boardRepository.GetAllByUserIdAsync(userId);
            var result = new List<BoardResponseDto>();

            foreach (var b in boards)
            {
                result.Add(new BoardResponseDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Description = b.Description,
                    CreatedAt = b.CreatedAt,
                    OwnerUserId = b.OwnerUserId
                });
            }

            return result;
        }

        public async Task<BoardResponseDto> GetBoardByIdAsync(int boardId)
        {
            var board = await _boardRepository.GetByIdAsync(boardId);
            if (board == null) return null;

            return new BoardResponseDto
            {
                Id = board.Id,
                Name = board.Name,
                Description = board.Description,
                CreatedAt = board.CreatedAt,
                OwnerUserId = board.OwnerUserId
            };
        }

        public async Task<bool> UpdateBoardAsync(int boardId, BoardUpdateDto dto)
        {
            var board = await _boardRepository.GetByIdAsync(boardId);
            if (board == null) return false;

            board.Name = dto.Name;
            board.Description = dto.Description;

            await _boardRepository.UpdateAsync(board);
            return true;
        }

        public async Task<bool> DeleteBoardAsync(int boardId)
        {
            return await _boardRepository.DeleteAsync(boardId);
        }
    }
}
