using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using src.Core.Interfaces;
using src.Core.Models;
using src.Impl.Dtos;
using src.infra.Data;

namespace src.infra.Repository
{
    public class GroupRepository : IGroupRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<AppUser> _userManager;

        public GroupRepository(ApplicationDbContext db, UserManager<AppUser> userManager)
        {
            _context = db;
            _userManager = userManager;
        }

        public async Task<Group> CreateGroupAsync(CreateGroupDto dto, AppUser currentUser)
        {
            var currentUserId = currentUser.Id;
            
            var group = new Group
            {
                Nome = dto.Name,
                Descricao = dto.Descricao,
                DataCriacao = DateTime.UtcNow
            };

            _context.Groups.Add(group);
            await _context.SaveChangesAsync();

            var creatorRelation = new UserGroup
            {
                AppUserId = currentUserId, 
                GroupId = group.Id,
                IsAdmin = true,
                JoinedAt = DateTime.UtcNow
            };

            _context.Set<UserGroup>().Add(creatorRelation);

            if (dto.Users != null && dto.Users.Any())
            {
                    var validUserIds = dto.Users
                        .Where(id => !string.IsNullOrWhiteSpace(id) && id != currentUserId)
                        .Distinct()
                        .ToList();

                    var existingUserIds = await _context.Users
                        .Where(u => validUserIds.Contains(u.Id))
                        .Select(u => u.Id)
                        .ToListAsync();

                    foreach (var userId in existingUserIds)
                    {
                        var memberRelation = new UserGroup
                        {
                            AppUserId = userId,
                            GroupId = group.Id,
                            IsAdmin = false,
                            JoinedAt = DateTime.UtcNow
                        };

                        _context.Set<UserGroup>().Add(memberRelation);
                    }
                }

                await _context.SaveChangesAsync();
                return group;
            }

        public async Task<bool> AddMemberToGroupAsync(int groupId, string userId)
        {
            var groupExists = await _context.Groups.AnyAsync(g => g.Id == groupId);
            if (!groupExists)
                return false;

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return false;

            var alreadyMember = await _context.Set<UserGroup>()
                .AnyAsync(ug => ug.GroupId == groupId && ug.AppUserId == userId);
            
            if (alreadyMember)
                return false;

            var userGroup = new UserGroup
            {
                AppUserId = userId,
                GroupId = groupId,
                IsAdmin = false,
                JoinedAt = DateTime.UtcNow
            };

            _context.Set<UserGroup>().Add(userGroup);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RemoveMemberFromGroupAsync(int groupId, string userId)
        {
            var userGroup = await _context.Set<UserGroup>()
                .FirstOrDefaultAsync(ug => ug.GroupId == groupId && ug.AppUserId == userId);

            if (userGroup == null)
                return false;

            _context.Set<UserGroup>().Remove(userGroup);
            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<bool> UserIsInGroupAsync(int groupId, string userId)
        {
            return await _context.Set<UserGroup>()
                .AnyAsync(ug => ug.GroupId == groupId && ug.AppUserId == userId);
        }

        public async Task<bool> IsUserGroupAdmin(int groupId, string userId)
        {
            return await _context.Set<UserGroup>()
                .AnyAsync(ug => ug.GroupId == groupId 
                             && ug.AppUserId == userId 
                             && ug.IsAdmin);
        }

        public async Task<List<GroupMemberDto>> ListMembersGroup(int groupId)
        {
            var members = await _context.Set<UserGroup>()
                .Where(ug => ug.GroupId == groupId)
                .Select(ug => new GroupMemberDto
                {
                    Id = ug.AppUser!.Id,
                    Username = ug.AppUser.UserName!,
                    Description = ug.AppUser.Description,
                    ProfilePicture = ug.AppUser.ProfilePicture,
                    Status = ug.AppUser.Status,
                    IsAdmin = ug.IsAdmin
                })
                .OrderByDescending(m => m.IsAdmin)
                .ThenBy(m => m.Username)
                .ToListAsync();

            return members;
        }

        public async Task<List<GroupDto>> GetUserGroupsAsync(string userId)
{
    return await _context.Set<UserGroup>()
        .Where(ug => ug.AppUserId == userId)
        .OrderByDescending(ug => ug.Group!.DataCriacao)
        .Select(ug => new GroupDto
        {
            Id = ug.Group!.Id,
            Name = ug.Group.Nome,
            DataCriacao = ug.Group.DataCriacao,
            Members = ug.Group.UserGroups.Select(member => new GroupMemberDto
            {
                Id = member.AppUser!.Id,
                Username = member.AppUser.UserName!,
                Description = member.AppUser.Description,
                ProfilePicture = member.AppUser.ProfilePicture,
                Status = member.AppUser.Status,
                IsAdmin = member.IsAdmin
            }).ToList()
        })
        .ToListAsync();
}

        public async Task<Group?> GetGroupByIdAsync(int groupId)
        {
            return await _context.Groups
                .Include(g => g.UserGroups)
                    .ThenInclude(ug => ug.AppUser)
                .FirstOrDefaultAsync(g => g.Id == groupId);
        }

        public async Task<bool> PromoteToAdminAsync(int groupId, string userId)
        {
            var userGroup = await _context.Set<UserGroup>()
                .FirstOrDefaultAsync(ug => ug.GroupId == groupId && ug.AppUserId == userId);

            if (userGroup == null)
                return false;

            userGroup.IsAdmin = true;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DemoteFromAdminAsync(int groupId, string userId)
        {
            var userGroup = await _context.Set<UserGroup>()
                .FirstOrDefaultAsync(ug => ug.GroupId == groupId && ug.AppUserId == userId);

            if (userGroup == null || !userGroup.IsAdmin)
                return false;

            userGroup.IsAdmin = false;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<GroupMemberDto>> ListGroupAdminsAsync(int groupId)
        {
            var admins = await _context.Set<UserGroup>()
                .Where(ug => ug.GroupId == groupId && ug.IsAdmin)
                .Select(ug => new GroupMemberDto
                {
                    Id = ug.AppUser!.Id,
                    Username = ug.AppUser.UserName!,
                    Description = ug.AppUser.Description,
                    ProfilePicture = ug.AppUser.ProfilePicture,
                    Status = ug.AppUser.Status,
                    IsAdmin = true
                })
                .ToListAsync();

            return admins;
        }

        public async Task<GroupMessage> CreateGroupMessageAsync(GroupMessage message)
        {
            _context.GroupMessages.Add(message);
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task<List<GroupMessage>> GetGroupMessagesAsync(int groupId)
        {
            return await _context.GroupMessages
                .Where(m => m.GroupId == groupId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }
    }
}