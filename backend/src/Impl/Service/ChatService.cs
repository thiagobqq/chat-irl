using src.Core.Interfaces;
using src.Core.Models;
using Microsoft.AspNetCore.Identity;
using src.Impl.Dtos;
using System.Collections.Concurrent; 

namespace src.Impl.Service
{
    public class ChatService : IChatService
    {
        private readonly IChatMessageRepository _chatRepository;
        private readonly UserManager<AppUser> _userManager;
        
        private static readonly ConcurrentDictionary<string, string> _userConnections = new();

        public ChatService(IChatMessageRepository chatRepository, UserManager<AppUser> userManager)
        {
            _chatRepository = chatRepository;
            _userManager = userManager;
        }

        public async Task<List<ChatMessageDto>> GetChatHistoryAsync(string currentUserId, string otherUserId)
        {
            return await _chatRepository.GetChatHistoryAsync(currentUserId, otherUserId);
        }

        public async Task<List<ConversationDto>> GetConversationsAsync(string currentUserId)
        {
            var conversations = await _chatRepository.GetConversationsAsync(currentUserId);
            
            foreach (var conv in conversations)
            {
                conv.IsOnline = IsUserOnline(conv.UserId);
            }
            
            return conversations;
        }

        public async Task<ChatMessage> SendMessageAsync(string senderId, string senderUsername, string receiverId, string message)
        {
            var receiver = await _userManager.FindByIdAsync(receiverId);
            if (receiver == null)
            {
                throw new ArgumentException("Receptor não encontrado");
            }

            var chatMessage = new ChatMessage
            {
                SenderId = senderId,
                SenderUsername = senderUsername,
                ReceiverId = receiverId,
                ReceiverUsername = receiver.UserName!,
                Message = message,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            return await _chatRepository.CreateMessageAsync(chatMessage);
        }

        public async Task MarkMessagesAsReadAsync(string senderId, string receiverId)
        {
            await _chatRepository.MarkMessagesAsReadAsync(senderId, receiverId);
        }

        public async Task<List<UserChatDto>> GetAvailableUsersAsync(string currentUserId)
        {
            var users = await _chatRepository.GetAvailableUsersAsync(currentUserId);
            
            foreach (var user in users)
            {
                user.IsOnline = IsUserOnline(user.Id);
            }
            
            return users;
        }

        public void AddUserConnection(string userId, string connectionId)
        {
            _userConnections.AddOrUpdate(userId, connectionId, (key, oldValue) => connectionId);
        }

        public void RemoveUserConnection(string userId)
        {
            _userConnections.TryRemove(userId, out _);
        }

        public string GetUserConnection(string userId)
        {
            return _userConnections.TryGetValue(userId, out var connectionId) ? connectionId : "";
        }

        public List<string> GetOnlineUsers()
        {
            return _userConnections.Keys.ToArray().ToList();
        }

        public bool IsUserOnline(string userId)
        {
            return _userConnections.ContainsKey(userId);
        }
    }
}