using DataTransferObject.List;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BL.Interfaces
{
    public interface IListService
    {
        Task<ListResponseDto> CreateListAsync(ListCreateDto dto);
        Task<ListResponseDto> GetListByIdAsync(int id);
        Task<IEnumerable<ListResponseDto>> GetListsByBoardIdAsync(int boardId);
        Task<bool> UpdateListAsync(int id, ListUpdateDto dto);
        Task<bool> DeleteListAsync(int id);
    }
}
