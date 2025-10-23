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
        Task<List<Group>> GetUserGroupsAsync(string userId);
        Task<GroupMessage> CreateGroupMessageAsync(GroupMessage message);
        Task<List<GroupMessage>> GetGroupMessagesAsync(int groupId);
        
        Task<bool> AddMemberToGroupAsync(int groupId, string userId);
        Task<bool> RemoveMemberFromGroupAsync(int groupId, string userId);
        Task<bool> UserIsInGroupAsync(int groupId, string userId);
    }
    
}