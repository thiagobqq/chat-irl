using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace src.Core.Models
{
    public class AppUser : IdentityUser
    {
        public string? ProfilePicture { get; set; }

        public string? BackgroundPicture { get; set; } 

        public string? Description { get; set; } 
        public UserStatus Status { get; set; }
        public ICollection<Group> Groups { get; set; } = new List<Group>();
    }
    
    public enum UserStatus
    {
        Available,
        Busy,
        Away,
        Offline
    }
}