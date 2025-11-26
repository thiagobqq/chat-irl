using src.Core.Models;

public class UserGroup
{
    public string AppUserId { get; set; } = string.Empty;
    public AppUser? AppUser { get; set; }
    
    public int GroupId { get; set; }
    public Group? Group { get; set; }
    
    public bool IsAdmin { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    
}
