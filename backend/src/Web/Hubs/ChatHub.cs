using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using src.Core.Interfaces;
using src.Core.Models;
using src.Impl.Dtos;
using System.Security.Claims;

namespace src.web.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;
        private readonly UserManager<AppUser> _userManager;
        private readonly IGroupService _groupService;
        
        private static readonly Dictionary<string, HashSet<int>> _connectionGroups = new();

        public ChatHub(
            IChatService chatService, 
            UserManager<AppUser> userManager,
            IGroupService groupService)
        {
            _chatService = chatService;
            _userManager = userManager;
            _groupService = groupService;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(userId))
            {
                _chatService.AddUserConnection(userId, Context.ConnectionId);
                _connectionGroups[Context.ConnectionId] = new HashSet<int>();
                
                await Clients.Others.SendAsync("UserConnected", userId);
                
                var onlineUsers = _chatService.GetOnlineUsers();
                await Clients.Caller.SendAsync("OnlineUsers", onlineUsers);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(userId))
            {
                if (_connectionGroups.TryGetValue(Context.ConnectionId, out var userGroups))
                {
                    foreach (var groupId in userGroups.ToList())
                    {
                        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"group_{groupId}");
                        await Clients.Group($"group_{groupId}").SendAsync("UserLeftGroup", userId, groupId);
                    }
                    
                    _connectionGroups.Remove(Context.ConnectionId);
                }
                
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
                
                if (string.IsNullOrEmpty(senderId))
                {
                    await Clients.Caller.SendAsync("Error", "Usuário não autenticado");
                    return;
                }

                var sender = await _userManager.FindByIdAsync(senderId);
                if (sender == null)
                {
                    await Clients.Caller.SendAsync("Error", "Usuário não encontrado");
                    return;
                }

                var message = await _chatService.SendMessageAsync(
                    senderId, 
                    sender.UserName!, 
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
        
        public async Task JoinGroup(int groupId)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return;

            await Groups.AddToGroupAsync(Context.ConnectionId, $"group_{groupId}");
            
            if (!_connectionGroups.ContainsKey(Context.ConnectionId))
            {
                _connectionGroups[Context.ConnectionId] = new HashSet<int>();
            }
            _connectionGroups[Context.ConnectionId].Add(groupId);
            
            await Clients.Group($"group_{groupId}").SendAsync("UserJoinedGroup", userId, groupId);
        }

        public async Task LeaveGroup(int groupId)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return;

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"group_{groupId}");
            
            if (_connectionGroups.TryGetValue(Context.ConnectionId, out var userGroups))
            {
                userGroups.Remove(groupId);
            }
            
            await Clients.Group($"group_{groupId}").SendAsync("UserLeftGroup", userId, groupId);
        }

        public async Task SendMessageToGroup(int groupId, string message)
        {
            try
            {
                var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(senderId))
                {
                    await Clients.Caller.SendAsync("Error", "Usuário não autenticado");
                    return;
                }

                var sender = await _userManager.FindByIdAsync(senderId);
                if (sender == null)
                {
                    await Clients.Caller.SendAsync("Error", "Usuário não encontrado");
                    return;
                }

                var groupMessage = await _groupService.SendMessageAsync(
                    groupId, 
                    senderId, 
                    message
                );

                var messageDto = new GroupMessageDto
                {
                    Id = groupMessage.Id,
                    GroupId = groupMessage.GroupId,
                    SenderId = groupMessage.SenderId,
                    SenderUsername = groupMessage.SenderUsername,
                    Message = groupMessage.Message,
                    SentAt = groupMessage.SentAt
                };

                await Clients.Group($"group_{groupId}").SendAsync("ReceiveGroupMessage", messageDto);
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", ex.Message);
            }
        }
    }
}