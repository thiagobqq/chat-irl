using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace src.Core.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public string SenderId { get; set; } = string.Empty;
        public string SenderUsername { get; set; } = string.Empty;
        public string ReceiverId { get; set; } = string.Empty;
        public string ReceiverUsername { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }        
        public AppUser Sender { get; set; }
        public AppUser Receiver { get; set; }
    }
}