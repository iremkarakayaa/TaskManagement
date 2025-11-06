using BL.Interfaces;
using DataAccessLayer.Interfaces;
using DataTransferObject.Card;
using Entity;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BL.Services
{
    public class CardService : ICardService
    {
        private readonly ICardRepository _cardRepository;
        private readonly INotificationService? _notificationService;
        private readonly IBoardRepository _boardRepository;

        public CardService(ICardRepository cardRepository, IBoardRepository boardRepository, INotificationService? notificationService = null)
        {
            _cardRepository = cardRepository;
            _notificationService = notificationService;
            _boardRepository = boardRepository;
        }

        public async Task<CardResponseDto> CreateCardAsync(CardCreateDto dto)
        {
            var card = new Card
            {
                Title = dto.Title,
                Description = dto.Description,
                DueDate = dto.DueDate,
                ListId = dto.ListId,
                AssignedUserId = dto.AssignedUserId
            };

            var added = await _cardRepository.AddAsync(card);

            return new CardResponseDto
            {
                Id = added.Id,
                Title = added.Title,
                Description = added.Description,
                DueDate = added.DueDate,
                IsCompleted = added.IsCompleted,
                ListId = added.ListId,
                AssignedUserId = added.AssignedUserId
            };
        }

        public async Task<CardResponseDto> GetCardByIdAsync(int id)
        {
            var card = await _cardRepository.GetByIdAsync(id);
            if (card == null) return null;

            return new CardResponseDto
            {
                Id = card.Id,
                Title = card.Title,
                Description = card.Description,
                DueDate = card.DueDate,
                IsCompleted = card.IsCompleted,
                ListId = card.ListId,
                AssignedUserId = card.AssignedUserId
            };
        }

        public async Task<IEnumerable<CardResponseDto>> GetCardsByListIdAsync(int listId)
        {
            var cards = await _cardRepository.GetByListIdAsync(listId);
            var result = new List<CardResponseDto>();

            foreach (var c in cards)
            {
                result.Add(new CardResponseDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    DueDate = c.DueDate,
                    IsCompleted = c.IsCompleted,
                    ListId = c.ListId,
                    AssignedUserId = c.AssignedUserId
                });
            }

            return result;
        }

        public async Task<bool> UpdateCardAsync(int id, CardUpdateDto dto)
        {
            var card = await _cardRepository.GetByIdAsync(id);
            if (card == null) return false;

            card.Title = dto.Title;
            card.Description = dto.Description;
            card.DueDate = dto.DueDate;
            card.IsCompleted = dto.IsCompleted;
            card.AssignedUserId = dto.AssignedUserId;

            await _cardRepository.UpdateAsync(card);
            return true;
        }

        public async Task<bool> DeleteCardAsync(int id)
        {
            return await _cardRepository.DeleteAsync(id);
        }

        public async Task<bool> AssignCardToUserAsync(int cardId, int userId, int assignedByUserId)
        {
            var card = await _cardRepository.GetByIdAsync(cardId);
            if (card == null) return false;

            // Kartın listesini al ve board bilgisini bul
            var list = await _cardRepository.GetListByCardIdAsync(cardId);
            if (list == null) return false;

            var board = await _boardRepository.GetByIdAsync(list.BoardId);
            if (board == null) return false;

            // Eski atanan kullanıcı varsa bildirim gönder
            if (_notificationService != null && card.AssignedUserId.HasValue && card.AssignedUserId.Value != userId)
            {
                await _notificationService.CreateNotificationAsync(
                    card.AssignedUserId.Value,
                    "Kart Ataması Kaldırıldı",
                    $"'{card.Title}' kartından atamanız kaldırıldı. Pano: {board.Name}",
                    NotificationType.CardAssigned,
                    board.Id,
                    card.Id
                );
            }

            // Kartı yeni kullanıcıya ata
            card.AssignedUserId = userId;
            await _cardRepository.UpdateAsync(card);

            // Yeni atanan kullanıcıya bildirim gönder
            if (_notificationService != null)
            {
                await _notificationService.CreateNotificationAsync(
                    userId,
                    "Karta Atandınız",
                    $"'{card.Title}' kartına atandınız. Pano: {board.Name}",
                    NotificationType.CardAssigned,
                    board.Id,
                    card.Id
                );
            }

            return true;
        }

        public async Task<bool> UnassignCardAsync(int cardId, int unassignedByUserId)
        {
            var card = await _cardRepository.GetByIdAsync(cardId);
            if (card == null || !card.AssignedUserId.HasValue) return false;

            // Kartın listesini al ve board bilgisini bul
            var list = await _cardRepository.GetListByCardIdAsync(cardId);
            if (list == null) return false;

            var board = await _boardRepository.GetByIdAsync(list.BoardId);
            if (board == null) return false;

            var assignedUserId = card.AssignedUserId.Value;

            // Kart atamasını kaldır
            card.AssignedUserId = null;
            await _cardRepository.UpdateAsync(card);

            // Atanan kullanıcıya bildirim gönder
            if (_notificationService != null)
            {
                await _notificationService.CreateNotificationAsync(
                    assignedUserId,
                    "Kart Ataması Kaldırıldı",
                    $"'{card.Title}' kartından atamanız kaldırıldı. Pano: {board.Name}",
                    NotificationType.CardAssigned,
                    board.Id,
                    card.Id
                );
            }

            return true;
        }
    }
}
