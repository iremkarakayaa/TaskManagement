using BL.Interfaces;
using DataTransferObject.List;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListController : ControllerBase
    {
        private readonly IListService _listService;

        public ListController(IListService listService)
        {
            _listService = listService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ListCreateDto dto)
        {
            var list = await _listService.CreateListAsync(dto);
            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var list = await _listService.GetListByIdAsync(id);
            if (list == null) return NotFound();
            return Ok(list);
        }

        [HttpGet("board/{boardId}")]
        public async Task<IActionResult> GetByBoardId(int boardId)
        {
            var lists = await _listService.GetListsByBoardIdAsync(boardId);
            return Ok(lists);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ListUpdateDto dto)
        {
            var updated = await _listService.UpdateListAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _listService.DeleteListAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
