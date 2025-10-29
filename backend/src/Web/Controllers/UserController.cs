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