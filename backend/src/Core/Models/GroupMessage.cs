using System;

namespace src.Core.Models
{
    public class GroupMessage
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string SenderId { get; set; } = string.Empty;
        public string SenderUsername { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }

        public Group Group { get; set; } = null!;
        public AppUser Sender { get; set; } = null!;
    }
}