using src.Core.Models;
using src.Impl.Dtos;

namespace src.Core.Interfaces
{
    public interface IGroupService
    {
        Task<Group> CreateGroupAsync(CreateGroupDto dto, string currentUserId);
        Task<List<GroupDto>> GetUserGroupsAsync(string userId);
        Task<GroupMessage> SendMessageAsync(int groupId, string senderId, string message);
        Task<List<GroupMessage>> GetMessagesAsync(int groupId, string userId); 
        Task<bool> AddMemberAsync(int groupId, string userId, string requesterId);
        Task<bool> RemoveMemberAsync(int groupId, string userId, string requesterId);
        Task<List<GroupMemberDto>> ListMembersGroupAsync(int groupId);

        Task<bool> PromoteToAdminAsync(int groupId, string userId, string requesterId);
        
        Task<bool> DemoteFromAdminAsync(int groupId, string userId, string requesterId);
        
        Task<List<GroupMemberDto>> ListGroupAdminsAsync(int groupId);
    }
}