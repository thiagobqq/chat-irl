using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace src.Core.Models
{
    public class AppUser : IdentityUser
    {
        public string ProfilePicture { get; set; } = string.Empty;
        public ICollection<Group> Groups { get; set; } = new List<Group>();  
    }
}