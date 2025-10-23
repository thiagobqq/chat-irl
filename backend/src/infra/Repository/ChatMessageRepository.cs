using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using src.Core.Interfaces;
using src.Core.Models;
using src.Impl.Dtos;
using src.infra.Data;

namespace src.infra.Repository
{
    public class ChatMessageRepository : IChatMessageRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<AppUser> _userManager;

        public ChatMessageRepository(ApplicationDbContext context, UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<List<ChatMessageDto>> GetChatHistoryAsync(string currentUserId, string otherUserId)
        {
            return await _context.ChatMessages
                .Where(m =>
                    (m.SenderId == currentUserId && m.ReceiverId == otherUserId) ||
                    (m.SenderId == otherUserId && m.ReceiverId == currentUserId))
                .OrderBy(m => m.SentAt)
                .Select(m => new ChatMessageDto
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    SenderUsername = m.SenderUsername,
                    ReceiverId = m.ReceiverId,
                    ReceiverUsername = m.ReceiverUsername,
                    Message = m.Message,
                    SentAt = m.SentAt,
                    IsRead = m.IsRead
                })
                .ToListAsync();
        }

        public async Task<List<ConversationDto>> GetConversationsAsync(string currentUserId)
        {
            var conversations = await _context.ChatMessages
                .Where(m => m.SenderId == currentUserId || m.ReceiverId == currentUserId)
                .GroupBy(m => m.SenderId == currentUserId ? m.ReceiverId : m.SenderId)
                .Select(g => new
                {
                    UserId = g.Key,
                    LastMessage = g.OrderByDescending(m => m.SentAt).FirstOrDefault(),
                    UnreadCount = g.Count(m => m.ReceiverId == currentUserId && !m.IsRead)
                })
                .ToListAsync();

            var result = new List<ConversationDto>();
            
            foreach (var conv in conversations)
            {
                var user = await _userManager.FindByIdAsync(conv.UserId);
                if (user != null)
                {
                    result.Add(new ConversationDto
                    {
                        UserId = conv.UserId,
                        Username = user.UserName!,
                        Email = user.Email!,
                        LastMessage = conv.LastMessage?.Message!,
                        LastMessageDate = conv.LastMessage?.SentAt,
                        UnreadCount = conv.UnreadCount,
                        IsOnline = false 
                    });
                }
            }

            return result.OrderByDescending(c => c.LastMessageDate).ToList();
        }

        public async Task<ChatMessage> CreateMessageAsync(ChatMessage message)
        {
            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task<List<ChatMessage>> GetUnreadMessagesAsync(string senderId, string receiverId)
        {
            return await _context.ChatMessages
                .Where(m => m.SenderId == senderId && m.ReceiverId == receiverId && !m.IsRead)
                .ToListAsync();
        }

        public async Task MarkMessagesAsReadAsync(string senderId, string receiverId)
        {
            var unreadMessages = await GetUnreadMessagesAsync(senderId, receiverId);
            
            foreach (var msg in unreadMessages)
            {
                msg.IsRead = true;
            }

            if (unreadMessages.Any())
            {
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _context.ChatMessages
                .CountAsync(m => m.ReceiverId == userId && !m.IsRead);
        }

        public async Task<ChatMessage?> GetMessageByIdAsync(int messageId)
        {
            return await _context.ChatMessages.FindAsync(messageId);
        }

        public async Task<List<UserChatDto>> GetAvailableUsersAsync(string currentUserId)
        {
            var users = await _userManager.Users
                .Where(u => u.Id != currentUserId)
                .Select(u => new UserChatDto
                {
                    Id = u.Id,
                    UserName = u.UserName!,
                    Email = u.Email!,
                    IsOnline = false 
                })
                .ToListAsync();

            return users;
        }
    }
}