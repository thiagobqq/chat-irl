using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using src.Core.Models;
using src.Impl.Dtos;

namespace src.Core.Interfaces
{
    public interface IChatService
    {
        Task<List<ChatMessageDto>> GetChatHistoryAsync(string currentUserId, string otherUserId);
        Task<List<ConversationDto>> GetConversationsAsync(string currentUserId);
        Task<ChatMessage> SendMessageAsync(string senderId, string senderUsername, string receiverId, string message);
        Task MarkMessagesAsReadAsync(string senderId, string receiverId);
        Task<List<UserChatDto>> GetAvailableUsersAsync(string currentUserId);
        void AddUserConnection(string userId, string connectionId);
        void RemoveUserConnection(string userId);
        string GetUserConnection(string userId);
        List<string> GetOnlineUsers();
        bool IsUserOnline(string userId);
    }
}