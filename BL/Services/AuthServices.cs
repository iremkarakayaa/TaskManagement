using BL.Interfaces;
using DataAccessLayer.Interfaces;
using DataLayer.DataTransferObject.User;
using Entity;
using System.Threading.Tasks;

namespace BL.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;

        public AuthService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            var userExists = await _userRepository.GetByUsernameAsync(registerDto.Username);
            if (userExists != null)
            {
                return new AuthResponseDto { Success = false, Message = "Kullanıcı zaten mevcut." };
            }

            var newUser = new User
            {
                Username = registerDto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password)
            };

            await _userRepository.AddAsync(newUser);

            return new AuthResponseDto { Success = true, Message = "Kayıt başarılı." };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.GetByUsernameAsync(loginDto.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                return new AuthResponseDto { Success = false, Message = "Kullanıcı adı veya şifre hatalı." };
            }

            return new AuthResponseDto { Success = true, Message = "Giriş başarılı." };
        }
    }
}
