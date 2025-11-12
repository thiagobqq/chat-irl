using src.Core.Models;

public class UserGroup
{
    public string AppUserId { get; set; } = string.Empty;
    public AppUser AppUser { get; set; } = new AppUser();
    
    public int GroupId { get; set; }
    public Group Group { get; set; } = new Group();
    
    public bool IsAdmin { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    
}
