using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using src.Core.Interfaces;
using src.Impl.Dtos;
using src.infra.Data;

namespace src.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {

        private readonly IUserRepository _userRepo;

        public UserController(IUserRepository user)
        {
            _userRepo = user;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _userRepo.GetUserById(userId);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpDelete("me")]
        public async Task<IActionResult> DeleteCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                return Unauthorized();
            }

            var result = await _userRepo.DeleteUser(userId);
            if (result)
            {
                return Ok();
            }
            else
            {
                return StatusCode(500, "An error occurred while deleting the user.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _userRepo.GetUserById(id);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // [HttpGet("all")]
        // public async Task<IActionResult> GetAllUsers()
        // {
        //     var users = await _userRepo.GetAllUsers();
        //     return Ok(users);
        // }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateUser([FromBody] UserDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                return Unauthorized();
            }
            
            var result = await _userRepo.UpdateUser(userId, dto);
            if (result)
            {
                return Ok();
            }
            else
            {
                return StatusCode(500, "An error occurred while updating the user.");
            }
        }
        
        
        
    }
}