using Microsoft.AspNetCore.Identity;
using src.Core.Interfaces;
using src.Core.Models;
using src.Impl.Dtos;

namespace src.Impl.Service
{
    public class GroupService : IGroupService
    {
        private readonly IGroupRepository _groupRepository;
        private readonly UserManager<AppUser> _userManager;

        public GroupService(IGroupRepository groupRepository, UserManager<AppUser> userManager)
        {
            _groupRepository = groupRepository;
            _userManager = userManager;
        }

        public async Task<Group> CreateGroupAsync(CreateGroupDto dto, string currentUserId)
        {
            var currentUser = await _userManager.FindByIdAsync(currentUserId);
            if (currentUser == null)
                throw new Exception("Usuário não encontrado");

            return await _groupRepository.CreateGroupAsync(dto, currentUser);
        }

        public async Task<List<Group>> GetUserGroupsAsync(string userId)
        {
            return await _groupRepository.GetUserGroupsAsync(userId);
        }

        public async Task<GroupMessage> SendMessageAsync(int groupId, string senderId, string message)
        {
            var isInGroup = await _groupRepository.UserIsInGroupAsync(groupId, senderId);
            if (!isInGroup)
                throw new Exception("Você não é membro deste grupo");

            var sender = await _userManager.FindByIdAsync(senderId);
            if (sender == null)
                throw new Exception("Usuário não encontrado");

            var groupMessage = new GroupMessage
            {
                GroupId = groupId,
                SenderId = senderId,
                SenderUsername = sender.UserName!,
                Message = message,
                SentAt = DateTime.UtcNow
            };

            return await _groupRepository.CreateGroupMessageAsync(groupMessage);
        }

        public async Task<List<GroupMessage>> GetMessagesAsync(int groupId, string userId)
        {
            var isInGroup = await _groupRepository.UserIsInGroupAsync(groupId, userId);
            if (!isInGroup)
                throw new Exception("Você não é membro deste grupo");

            return await _groupRepository.GetGroupMessagesAsync(groupId);
        }

        public async Task<bool> AddMemberAsync(int groupId, string userId, string requesterId)
        {
            var isInGroup = await _groupRepository.UserIsInGroupAsync(groupId, requesterId);
            if (!isInGroup)
                throw new Exception("Apenas membros podem adicionar novos membros");
            var isAdmin = await _groupRepository.IsUserGroupAdmin(groupId, requesterId);
            if (!isAdmin)
                throw new Exception("Voce nao tem permissão para isso");

            return await _groupRepository.AddMemberToGroupAsync(groupId, userId);
        }

        public async Task<bool> RemoveMemberAsync(int groupId, string userId, string requesterId)
        {
            var isInGroup = await _groupRepository.UserIsInGroupAsync(groupId, requesterId);
            if (!isInGroup)
                throw new Exception("Apenas membros podem remover membros");
            var isAdmin = await _groupRepository.IsUserGroupAdmin(groupId, requesterId);
            if (!isAdmin && userId != requesterId)
                throw new Exception("Voce nao tem permissão para isso");

            return await _groupRepository.RemoveMemberFromGroupAsync(groupId, userId);
        }

        public async Task<List<GroupMemberDto>> ListMembersGroupAsync(int groupId)
        {
            return await _groupRepository.ListMembersGroup(groupId);            
        }
    }
}