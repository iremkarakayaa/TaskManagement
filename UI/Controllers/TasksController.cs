using DataAccessLayer;
using DataTransferObject.User;
using Entity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly TaskManagementDbContext _context;

        public TasksController(TaskManagementDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetTasks(int userId)
        {
            var tasks = await _context.Tasks.Where(t => t.UserId == userId).ToListAsync();
            return Ok(tasks);
        }

        [HttpPost("{userId}")]
        public async Task<IActionResult> CreateTask(int userId, [FromBody] TaskCreateDto dto)
        {
            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                DueDate = dto.DueDate,
                IsCompleted = false,
                UserId = userId
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task created successfully" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskUpdateDto dto)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.DueDate = dto.DueDate;
            task.IsCompleted = dto.IsCompleted;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Task updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Task deleted successfully" });
        }
    }

}
