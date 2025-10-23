using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using src.Core.Models;
using src.Impl.Dtos;

namespace src.Core.Interfaces
{
    public interface IChatMessageRepository
    {
        Task<List<ChatMessageDto>> GetChatHistoryAsync(string currentUserId, string otherUserId);
        Task<List<ConversationDto>> GetConversationsAsync(string currentUserId);
        Task<ChatMessage> CreateMessageAsync(ChatMessage message);
        Task<List<ChatMessage>> GetUnreadMessagesAsync(string senderId, string receiverId);
        Task MarkMessagesAsReadAsync(string senderId, string receiverId);
        Task<int> GetUnreadCountAsync(string userId);
        Task<ChatMessage> GetMessageByIdAsync(int messageId);
        Task<List<UserChatDto>> GetAvailableUsersAsync(string currentUserId);
    }
}