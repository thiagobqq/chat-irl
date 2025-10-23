using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using src.Core.Models;
using src.Application.Dtos;

namespace src.Core.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDTO> Login(UserManager<AppUser> userManager, SignInManager<AppUser> signinManager, AuthDTO request);
        Task<RegisterResponseDto> Register(UserManager<AppUser> userManager, SignInManager<AppUser> signinManager, RegisterDto request);
    }
}