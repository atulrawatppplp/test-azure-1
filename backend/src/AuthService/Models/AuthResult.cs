namespace MiniOrderManagement.AuthService.Models;

public class AuthResult
{
    public string Token { get; set; } = string.Empty;
    public User User { get; set; } = new();
}
