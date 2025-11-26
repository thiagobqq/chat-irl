using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using src.Core.Interfaces;
using src.Core.Models;
using System;
using System.Linq;
using System.Security.Cryptography;
using src.infra.Data;
using src.Application.Dtos;

namespace src.Impl.Service
{
    public class AuthService : IAuthService
    {
        public readonly TokenService _tokenService;
        private readonly ApplicationDbContext _dbContext;
        public AuthService(TokenService tokenService, ApplicationDbContext db)
        {
            _dbContext = db;
            _tokenService = tokenService;
        }

        public async Task<AuthResponseDTO> Login(UserManager<AppUser> userManager, SignInManager<AppUser> signinManager, AuthDTO request)
        {
            var user = await userManager.FindByEmailAsync(request.Email!.ToLower());
            if (user == null)
                throw new Exception("Invalid credentials");


            var result = await signinManager.CheckPasswordSignInAsync(user, request.Password!, false);

            if (!result.Succeeded)
                throw new Exception("Invalid credentials");

            return new AuthResponseDTO
            {
                email = user!.Email,
                username = user.UserName,
                Token = await _tokenService.createToken(user),
                profilePicture = user.ProfilePicture,
                backgroundPicture =  user.BackgroundPicture,
                Id = user.Id
            };
        }

        public async Task<bool> Register(UserManager<AppUser> userManager, RegisterDto request)
        {
            var user = await userManager.Users.FirstOrDefaultAsync(x => x.Email == request.Email!.ToLower());
            if (user != null)
                throw new Exception("Email already in use");

            var newUser = new AppUser
            {
                Email = request.Email!.ToLower(),
                UserName = request.Name!.ToLower()
            };

            var result = await userManager.CreateAsync(newUser, request.Password!);
            if (!result.Succeeded)
            {
                var errorMessages = string.Join("; ", result.Errors.Select(e => $"{e.Code}: {e.Description}"));                
                return false;
            }

            await _dbContext.SaveChangesAsync();

            return true;
        }

    }
}