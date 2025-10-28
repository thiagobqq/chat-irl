using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using src.Core.Models;

namespace src.Application.Dtos
{
    public class RegisterDto
    {
        [Required]
        public string? Name { get; set; }

        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        public string? Password { get; set; }

        

    }



    public class RegisterResponseDto
    {
        public string? Email { get; set; }
        public string? Name { get; set; }
        public string? Id {get; set; }
        public string? Token { get; set; }
    }

    public class AuthDTO
    {

        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]

        public string? Password { get; set; }
    }

    public class AuthResponseDTO
    {
        public string? Token { get; set; }
        public string? email { get; set; }
        public string? username { get; set; }

        public string? Id { get; set; }

        
    }
    public class ForgotPasswordDTO
    {
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    }


    public class changePasswordDTO
    {
        [Required]
        public string? Token { get; set; }

        [Required]
        public string? Email { get; set; }

        public string? Password { get; set; }
    }
}