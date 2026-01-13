using Microsoft.AspNetCore.Mvc;
using DataAccessLayer;
using Entity;
using Microsoft.EntityFrameworkCore;

namespace UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BoardCollaborationController : ControllerBase
    {
        private readonly TaskManagementDbContext _context;

        public BoardCollaborationController(TaskManagementDbContext context)
        {
            _context = context;
        }

        // GET: api/boardcollaboration/{boardId}/members
        [HttpGet("{boardId}/members")]
        public async Task<IActionResult> GetBoardMembers(int boardId)
        {
            try
            {
                var members = await _context.BoardMembers
                    .Where(bm => bm.BoardId == boardId && bm.IsActive)
                    .Include(bm => bm.User)
                    .Select(bm => new
                    {
                        bm.Id,
                        bm.Role,
                        bm.JoinedAt,
                        User = new
                        {
                            bm.User.Id,
                            bm.User.Username,
                            bm.User.Email
                        }
                    })
                    .ToListAsync();

                return Ok(members);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting board members: {ex.Message}");
                return StatusCode(500, new { message = "Pano üyeleri yüklenirken bir hata oluştu", error = ex.Message });
            }
        }

        // POST: api/boardcollaboration/{boardId}/invite
        [HttpPost("{boardId}/invite")]
        public async Task<IActionResult> InviteUser(int boardId, [FromBody] InviteUserRequest request)
        {
            try
            {
                // Kullanıcıyı ID ile bul
                var user = await _context.Users.FindAsync(request.UserId);
                if (user == null)
                    return NotFound(new { message = "Kullanıcı bulunamadı" });

                // Pano var mı kontrol et
                var board = await _context.Boards.FindAsync(boardId);
                if (board == null)
                    return NotFound(new { message = "Pano bulunamadı" });

                // Zaten üye mi kontrol et
                var existingMember = await _context.BoardMembers
                    .FirstOrDefaultAsync(bm => bm.BoardId == boardId && bm.UserId == user.Id);
                
                if (existingMember != null && existingMember.IsActive)
                    return BadRequest(new { message = "Kullanıcı zaten bu panonun üyesi" });

                // Bekleyen davet var mı kontrol et
                var existingInvitation = await _context.BoardInvitations
                    .FirstOrDefaultAsync(bi => bi.BoardId == boardId && bi.InvitedUserId == user.Id && bi.Status == InvitationStatus.Pending);

                if (existingInvitation != null)
                    return BadRequest(new { message = "Bu kullanıcıya zaten bir davet gönderilmiş" });

                // Davet oluştur
                var invitation = new BoardInvitation
                {
                    BoardId = boardId,
                    InvitedUserId = user.Id,
                    InvitedByUserId = 1, // Şimdilik sabit, gerçek kullanıcı ID'si kullanılacak
                    Role = request.Role,
                    Status = InvitationStatus.Pending,
                    Message = request.Message,
                    CreatedAt = DateTime.UtcNow
                };

                _context.BoardInvitations.Add(invitation);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Davet başarıyla gönderildi", invitationId = invitation.Id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error inviting user: {ex.Message}");
                return StatusCode(500, new { message = "Kullanıcı davet edilirken bir hata oluştu", error = ex.Message });
            }
        }

        // PUT: api/boardcollaboration/{boardId}/members/{userId}/role
        [HttpPut("{boardId}/members/{userId}/role")]
        public async Task<IActionResult> UpdateMemberRole(int boardId, int userId, [FromBody] UpdateRoleRequest request)
        {
            try
            {
                var member = await _context.BoardMembers
                    .FirstOrDefaultAsync(bm => bm.BoardId == boardId && bm.UserId == userId && bm.IsActive);

                if (member == null)
                    return NotFound(new { message = "Üye bulunamadı" });

                member.Role = request.Role;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Üye rolü güncellendi" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating member role: {ex.Message}");
                return StatusCode(500, new { message = "Üye rolü güncellenirken bir hata oluştu", error = ex.Message });
            }
        }

        // DELETE: api/boardcollaboration/{boardId}/members/{userId}
        [HttpDelete("{boardId}/members/{userId}")]
        public async Task<IActionResult> RemoveMember(int boardId, int userId)
        {
            try
            {
                var member = await _context.BoardMembers
                    .FirstOrDefaultAsync(bm => bm.BoardId == boardId && bm.UserId == userId && bm.IsActive);

                if (member == null)
                    return NotFound(new { message = "Üye bulunamadı" });

                member.IsActive = false;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Üye panodan çıkarıldı" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error removing member: {ex.Message}");
                return StatusCode(500, new { message = "Üye çıkarılırken bir hata oluştu", error = ex.Message });
            }
        }

        // GET: api/boardcollaboration/user/{userId}/boards
        [HttpGet("user/{userId}/boards")]
        public async Task<IActionResult> GetUserBoards(int userId)
        {
            try
            {
                var boards = await _context.BoardMembers
                    .Where(bm => bm.UserId == userId && bm.IsActive)
                    .Include(bm => bm.Board)
                    .ThenInclude(b => b.OwnerUser)
                    .Select(bm => new
                    {
                        bm.Board.Id,
                        bm.Board.Name,
                        bm.Board.Description,
                        bm.Board.CreatedAt,
                        bm.Board.IsArchived,
                        bm.Role,
                        Owner = new
                        {
                            bm.Board.OwnerUser.Id,
                            bm.Board.OwnerUser.Username,
                            bm.Board.OwnerUser.Email
                        }
                    })
                    .ToListAsync();

                return Ok(boards);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user boards: {ex.Message}");
                return StatusCode(500, new { message = "Kullanıcı panoları yüklenirken bir hata oluştu", error = ex.Message });
            }
        }

        // GET: api/boardcollaboration/user/{userId}/invitations
        [HttpGet("user/{userId}/invitations")]
        public async Task<IActionResult> GetUserInvitations(int userId)
        {
            try
            {
                var invitations = await _context.BoardInvitations
                    .Where(bi => bi.InvitedUserId == userId && bi.Status == InvitationStatus.Pending)
                    .Include(bi => bi.Board)
                    .ThenInclude(b => b.OwnerUser)
                    .Include(bi => bi.InvitedByUser)
                    .Select(bi => new
                    {
                        bi.Id,
                        bi.Role,
                        bi.Message,
                        bi.CreatedAt,
                        Board = new
                        {
                            bi.Board.Id,
                            bi.Board.Name,
                            bi.Board.Description,
                            Owner = new
                            {
                                bi.Board.OwnerUser.Id,
                                bi.Board.OwnerUser.Username,
                                bi.Board.OwnerUser.Email
                            }
                        },
                        InvitedBy = new
                        {
                            bi.InvitedByUser.Id,
                            bi.InvitedByUser.Username,
                            bi.InvitedByUser.Email
                        }
                    })
                    .ToListAsync();

                return Ok(invitations);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user invitations: {ex.Message}");
                return StatusCode(500, new { message = "Davetler yüklenirken bir hata oluştu", error = ex.Message });
            }
        }

        // PUT: api/boardcollaboration/invitations/{invitationId}/respond
        [HttpPut("invitations/{invitationId}/respond")]
        public async Task<IActionResult> RespondToInvitation(int invitationId, [FromBody] RespondToInvitationRequest request)
        {
            try
            {
                var invitation = await _context.BoardInvitations
                    .Include(bi => bi.Board)
                    .FirstOrDefaultAsync(bi => bi.Id == invitationId && bi.Status == InvitationStatus.Pending);

                if (invitation == null)
                    return NotFound(new { message = "Davet bulunamadı veya zaten yanıtlanmış" });

                invitation.Status = request.Accepted ? InvitationStatus.Accepted : InvitationStatus.Declined;
                invitation.RespondedAt = DateTime.UtcNow;

                if (request.Accepted)
                {
                    // Kullanıcıyı panoya ekle
                    var existingMember = await _context.BoardMembers
                        .FirstOrDefaultAsync(bm => bm.BoardId == invitation.BoardId && bm.UserId == invitation.InvitedUserId);

                    if (existingMember != null)
                    {
                        existingMember.IsActive = true;
                        existingMember.Role = invitation.Role;
                    }
                    else
                    {
                        var boardMember = new BoardMember
                        {
                            BoardId = invitation.BoardId,
                            UserId = invitation.InvitedUserId,
                            Role = invitation.Role,
                            JoinedAt = DateTime.UtcNow,
                            IsActive = true
                        };
                        _context.BoardMembers.Add(boardMember);
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = request.Accepted ? "Davet kabul edildi" : "Davet reddedildi",
                    boardId = invitation.BoardId
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error responding to invitation: {ex.Message}");
                return StatusCode(500, new { message = "Davet yanıtlanırken bir hata oluştu", error = ex.Message });
            }
        }
    }

    public class InviteUserRequest
    {
        public int UserId { get; set; }
        public BoardRole Role { get; set; } = BoardRole.Viewer;
        public string Message { get; set; } = string.Empty;
    }

    public class UpdateRoleRequest
    {
        public BoardRole Role { get; set; }
    }

    public class RespondToInvitationRequest
    {
        public bool Accepted { get; set; }
    }
}
