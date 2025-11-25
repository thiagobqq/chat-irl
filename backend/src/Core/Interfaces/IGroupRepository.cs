using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using src.Core.Models;
using src.Impl.Dtos;

namespace src.Core.Interfaces
{
    public interface IGroupRepository
    {
        Task<Group> CreateGroupAsync(CreateGroupDto dto, AppUser currentUser);
        Task<Group?> GetGroupByIdAsync(int groupId);
        Task<List<GroupDto>> GetUserGroupsAsync(string userId);
        Task<GroupMessage> CreateGroupMessageAsync(GroupMessage message);
        Task<List<GroupMessage>> GetGroupMessagesAsync(int groupId);

        Task<bool> AddMemberToGroupAsync(int groupId, string userId);
        Task<bool> RemoveMemberFromGroupAsync(int groupId, string userId);
        Task<bool> UserIsInGroupAsync(int groupId, string userId);

        Task<bool> IsUserGroupAdmin(int groupId, string userId);

        Task<List<GroupMemberDto>> ListMembersGroup(int groupId);
        Task<bool> PromoteToAdminAsync(int groupId, string userId);
        Task<bool> DemoteFromAdminAsync(int groupId, string userId);
        Task<List<GroupMemberDto>> ListGroupAdminsAsync(int groupId);
    }
    
}