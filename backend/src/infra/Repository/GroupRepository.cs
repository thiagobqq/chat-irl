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
            var group = new Group
            {
                Nome = dto.Name,
                Descricao = dto.Descricao,
                DataCriacao = DateTime.UtcNow,
                Users = new List<AppUser>()
            };

            group.Users.Add(currentUser);

            if (dto.Users != null && dto.Users.Any())
            {
                foreach (string userId in dto.Users)
                {
                    if (userId == currentUser.Id)
                        continue;

                    var user = await _userManager.FindByIdAsync(userId);
                    if (user != null)
                    {
                        group.Users.Add(user);
                    }
                }
            }
            _context.Groups.Add(group);
            await _context.SaveChangesAsync();

            return group;
        }

        public async Task<bool> AddMemberToGroupAsync(int groupId, string userId)
        {
            var group = await GetGroupByIdAsync(groupId);
            if (group == null)
                return false;

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return false;

            if (group.Users.Any(u => u.Id == userId))
                return false;

            group.Users.Add(user);
            await _context.SaveChangesAsync();

            return true;
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

        public async Task<Group?> GetGroupByIdAsync(int groupId)
        {
            return await _context.Groups
                .Include(g => g.Users)
                .FirstOrDefaultAsync(g => g.Id == groupId);
        }

        public async Task<List<Group>> GetUserGroupsAsync(string userId)
        {
            return await _context.Groups
                .Include(g => g.Users)
                .Where(g => g.Users.Any(u => u.Id == userId))
                .OrderByDescending(g => g.DataCriacao)
                .ToListAsync();
        }

        public async Task<bool> RemoveMemberFromGroupAsync(int groupId, string userId)
        {
            var group = await GetGroupByIdAsync(groupId);
            if (group == null)
                return false;

            var user = group.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null)
                return false;

            group.Users.Remove(user);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UserIsInGroupAsync(int groupId, string userId)
        {
            return await _context.Groups
                .AnyAsync(g => g.Id == groupId && g.Users.Any(u => u.Id == userId));
        }
        
    }
}