using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using src.Core.Models;

namespace src.Impl.Dtos
{
    public class UserDTO
    {
        public string Username { get; set; }= string.Empty;
        public string ProfilePicture { get; set; }= string.Empty;
        public string BackgroundPicture { get; set; }= string.Empty;
        public string Description { get; set; } = string.Empty;
        public UserStatus Status { get; set; }
    }
}