using BL.Interfaces;
using DataTransferObject.Card;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CardController : ControllerBase
    {
        private readonly ICardService _cardService;

        public CardController(ICardService cardService)
        {
            _cardService = cardService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CardCreateDto dto)
        {
            var card = await _cardService.CreateCardAsync(dto);
            return Ok(card);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var card = await _cardService.GetCardByIdAsync(id);
            if (card == null) return NotFound();
            return Ok(card);
        }

        [HttpGet("list/{listId}")]
        public async Task<IActionResult> GetByListId(int listId)
        {
            var cards = await _cardService.GetCardsByListIdAsync(listId);
            return Ok(cards);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CardUpdateDto dto)
        {
            var updated = await _cardService.UpdateCardAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _cardService.DeleteCardAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
