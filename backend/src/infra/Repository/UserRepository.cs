using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Identity.Client;
using src.Core.Interfaces;
using src.Core.Models;
using src.Impl.Dtos;
using src.infra.Data;

namespace src.infra.Repository
{
    public class UserRepository : IUserRepository
    {

        private readonly ApplicationDbContext _context;
        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }


        public async Task<UserDTO?> GetUserById(string userId)
        {
            var user = await _context.Users.FindAsync(userId);;
            if (user == null)
            {
                return null;
            }

            return new UserDTO
            {
                Username = user.UserName!,
                ProfilePicture = user.ProfilePicture,
                BackgroundPicture = user.BackgroundPicture,
                Description = user.Description,
                Status = user.Status
            };
        }

        public async Task<bool> UpdateUser(string userId, UserDTO dto)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return false;
            }

            if (!string.IsNullOrEmpty(dto.Username))
                user.UserName = dto.Username;

            if (!string.IsNullOrEmpty(dto.ProfilePicture))
                user.ProfilePicture = dto.ProfilePicture;

            if (!string.IsNullOrEmpty(dto.BackgroundPicture))
                user.BackgroundPicture = dto.BackgroundPicture;

            if (!string.IsNullOrEmpty(dto.Description))
                user.Description = dto.Description;

            user.Status = dto.Status;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<UserDTO>> GetAllUsers()
        {
            return _context.Users.Select(user => new UserDTO
            {
                Username = user.UserName!,
                ProfilePicture = user.ProfilePicture,
                BackgroundPicture = user.BackgroundPicture,
                Description = user.Description,
                Status = user.Status
            });
        }


        
        
        
    }
}