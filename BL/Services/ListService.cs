using BL.Interfaces;
using DataAccessLayer.Interfaces;
using DataTransferObject.List;
using Entity;
using System.Collections.Generic;
using System.Threading.Tasks;
using ListResponseList = System.Collections.Generic.List<DataTransferObject.List.ListResponseDto>;


namespace BL.Services
{
    public class ListService : IListService
    {
        private readonly IListRepository _listRepository;

        public ListService(IListRepository listRepository)
        {
            _listRepository = listRepository;
        }

        public async Task<ListResponseDto> CreateListAsync(ListCreateDto dto)
        {
            var list = new BoardList
            {
                Name = dto.Name,
                BoardId = dto.BoardId,
                Order = dto.Order
            };

            var added = await _listRepository.AddAsync(list);

            return new ListResponseDto
            {
                Id = added.Id,
                Name = added.Name,
                BoardId = added.BoardId,
                Order = added.Order
            };
        }

        public async Task<ListResponseDto> GetListByIdAsync(int id)
        {
            var list = await _listRepository.GetByIdAsync(id);
            if (list == null) return null;

            return new ListResponseDto
            {
                Id = list.Id,
                Name = list.Name,
                BoardId = list.BoardId,
                Order = list.Order
            };
        }

        public async Task<IEnumerable<ListResponseDto>> GetListsByBoardIdAsync(int boardId)
        {
            var lists = await _listRepository.GetByBoardIdAsync(boardId);
            var result = new System.Collections.Generic.List<ListResponseDto>();


            foreach (var l in lists)
            {
                result.Add(new ListResponseDto
                {
                    Id = l.Id,
                    Name = l.Name,
                    BoardId = l.BoardId,
                    Order = l.Order
                });
            }

            return result;
        }

        public async Task<bool> UpdateListAsync(int id, ListUpdateDto dto)
        {
            var list = await _listRepository.GetByIdAsync(id);
            if (list == null) return false;

            list.Name = dto.Name;
            list.Order = dto.Order;

            await _listRepository.UpdateAsync(list);
            return true;
        }

        public async Task<bool> DeleteListAsync(int id)
        {
            return await _listRepository.DeleteAsync(id);
        }
    }
}
