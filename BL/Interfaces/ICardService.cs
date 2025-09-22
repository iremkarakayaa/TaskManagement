using DataTransferObject.Card;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BL.Interfaces
{
    public interface ICardService
    {
        Task<CardResponseDto> CreateCardAsync(CardCreateDto dto);
        Task<CardResponseDto> GetCardByIdAsync(int id);
        Task<IEnumerable<CardResponseDto>> GetCardsByListIdAsync(int listId);
        Task<bool> UpdateCardAsync(int id, CardUpdateDto dto);
        Task<bool> DeleteCardAsync(int id);
        Task<bool> AssignCardToUserAsync(int cardId, int userId, int assignedByUserId);
        Task<bool> UnassignCardAsync(int cardId, int unassignedByUserId);
    }
}
