using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using src.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;
using src.Core.Interfaces;
using src.Application.Dtos;

namespace src.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {

        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signinManager;
        private readonly IAuthService _authService;
        public AuthController(UserManager<AppUser> userManager, SignInManager<AppUser> signinManager, IAuthService authService)
        {
            _authService = authService;
            _userManager = userManager;
            _signinManager = signinManager;

        }

        [HttpPost("forgotPassword")]
        public async Task<IActionResult> forgotPassword([FromBody] ForgotPasswordDTO request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return BadRequest();

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            return Ok(new { token });
            
        }

        [HttpPost("resetPassword")]
        public async Task<IActionResult> changePassword([FromBody] changePasswordDTO request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email!);
            if (user == null)
                return BadRequest();

            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token!));


            var a = await _userManager.ResetPasswordAsync(user, decodedToken, request.Password!);

            return Ok(a);

        }
        
        

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    throw new Exception("Invalid payload");

                var response = await _authService.Register(_userManager, request);
                
                if (!response)
                    throw new Exception("Failed to create user");
                return Ok(new
                {
                    message = "Registro realizado com sucesso",
                });
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthDTO request)
        {
            try
            {
                if (!ModelState.IsValid)
                    throw new Exception("Invalid payload");

                var response = await _authService.Login(_userManager, _signinManager, request);
                if (response != null)
                {
                    return Ok(response);
                }
                return BadRequest("Credenciais erradas");

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

        }

    }
}