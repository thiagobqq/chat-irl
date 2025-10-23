using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using src.Core.Interfaces;
using src.Core.Models;
using src.Impl.Dtos;
using src.infra.Data;
using System.Security.Claims;

namespace src.Web.hub
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;

        public ChatHub(IChatService chatService)
        {
            _chatService = chatService;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(userId))
            {
                _chatService.AddUserConnection(userId, Context.ConnectionId);
                
                await Clients.Others.SendAsync("UserConnected", userId);
                
                var onlineUsers = _chatService.GetOnlineUsers();
                await Clients.Caller.SendAsync("OnlineUsers", onlineUsers);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(userId))
            {
                _chatService.RemoveUserConnection(userId);
                await Clients.Others.SendAsync("UserDisconnected", userId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessageToUser(SendMessageDto dto)
        {
            try
            {
                var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var senderUsername = Context.User?.Identity?.Name;

                if (string.IsNullOrEmpty(senderId))
                {
                    await Clients.Caller.SendAsync("Error", "Usuário não autenticado");
                    return;
                }

                var message = await _chatService.SendMessageAsync(
                    senderId, 
                    senderUsername, 
                    dto.ReceiverId, 
                    dto.Message
                );

                var messageDto = new ChatMessageDto
                {
                    Id = message.Id,
                    SenderId = message.SenderId,
                    SenderUsername = message.SenderUsername,
                    ReceiverId = message.ReceiverId,
                    ReceiverUsername = message.ReceiverUsername,
                    Message = message.Message,
                    SentAt = message.SentAt,
                    IsRead = message.IsRead
                };

                var connectionId = _chatService.GetUserConnection(dto.ReceiverId);
                if (!string.IsNullOrEmpty(connectionId))
                {
                    await Clients.Client(connectionId).SendAsync("ReceiveMessage", messageDto);
                    messageDto.IsRead = true;
                    await _chatService.MarkMessagesAsReadAsync(senderId, dto.ReceiverId);
                }

                await Clients.Caller.SendAsync("MessageSent", messageDto);
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", ex.Message);
            }
        }

        public async Task MarkMessagesAsRead(string senderId)
        {
            var receiverId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(receiverId))
            {
                await _chatService.MarkMessagesAsReadAsync(senderId, receiverId);
                
                var connectionId = _chatService.GetUserConnection(senderId);
                if (!string.IsNullOrEmpty(connectionId))
                {
                    await Clients.Client(connectionId).SendAsync("MessagesRead", receiverId);
                }
            }
        }

        public async Task StartTyping(string receiverId)
        {
            var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var connectionId = _chatService.GetUserConnection(receiverId);
            
            if (!string.IsNullOrEmpty(connectionId))
            {
                await Clients.Client(connectionId).SendAsync("UserTyping", senderId);
            }
        }

        public async Task StopTyping(string receiverId)
        {
            var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var connectionId = _chatService.GetUserConnection(receiverId);
            
            if (!string.IsNullOrEmpty(connectionId))
            {
                await Clients.Client(connectionId).SendAsync("UserStoppedTyping", senderId);
            }
        }
    }
}