using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using src.Core.Models;
using src.Impl.Dtos;

namespace src.Core.Interfaces
{
    public interface IUserRepository
    {
        Task<bool> UpdateUser(string userId, UserDTO dto);
        Task<UserDTO?> GetUserById(string userId);
        Task<IEnumerable<UserDTO>> GetAllUsers();
        Task<bool> DeleteUser(string userId);
    }
}