using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using src.Core.Interfaces;
using src.Impl.Dtos;
using System.Security.Claims;

namespace src.web.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GroupController : ControllerBase
    {
        private readonly IGroupService _groupService;

        public GroupController(IGroupService groupService)
        {
            _groupService = groupService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                    return Unauthorized();

                var group = await _groupService.CreateGroupAsync(dto, userId);
                return Ok(new { message = "Grupo criado com sucesso", groupId = group.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("meus-grupos")]
        public async Task<IActionResult> GetMyGroups()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                    return Unauthorized();

                var groups = await _groupService.GetUserGroupsAsync(userId);
                return Ok(groups);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{groupId}/messages")]
        public async Task<IActionResult> GetGroupMessages(int groupId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                    return Unauthorized();

                var messages = await _groupService.GetMessagesAsync(groupId, userId);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{groupId}/add/{userId}")]
        public async Task<IActionResult> AddMember(int groupId, string userId)
        {
            try
            {
                var requesterId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (requesterId == null)
                    return Unauthorized();

                var success = await _groupService.AddMemberAsync(groupId, userId, requesterId);
                
                if (success)
                    return Ok(new { message = "Membro adicionado com sucesso" });
                
                return BadRequest(new { error = "Não foi possível adicionar o membro" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{groupId}/remove/{userId}")]
        public async Task<IActionResult> RemoveMember(int groupId, string userId)
        {
            try
            {
                var requesterId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (requesterId == null)
                    return Unauthorized();

                var success = await _groupService.RemoveMemberAsync(groupId, userId, requesterId);

                if (success)
                    return Ok(new { message = "Membro removido com sucesso" });

                return BadRequest(new { error = "Não foi possível remover o membro" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        [HttpGet("{groupId}/members")]
        public async Task<IActionResult> ListMembers(int groupId)
        {
            var response = await _groupService.ListMembersGroupAsync(groupId);
            return Ok(response);
            
        }
    }
}