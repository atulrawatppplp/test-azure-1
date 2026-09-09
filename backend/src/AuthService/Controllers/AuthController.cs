using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniOrderManagement.AuthService.Data;
using MiniOrderManagement.AuthService.Models;

namespace MiniOrderManagement.AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly bool _useMockAuth;

    public AuthController(AuthDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
        _useMockAuth = configuration.GetValue<bool>("UseMockAuth", false);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResult>> Login([FromBody] LoginRequest request)
    {
        User? user;

        if (_useMockAuth)
        {
            // Mock authentication
            var demoUser = SeedData.DemoUser;
            if (request.Email != demoUser.Email || request.Password.Length < 4)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
            user = demoUser;
        }
        else
        {
            // Database authentication
            user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || request.Password.Length < 4)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
        }

        var token = $"{(_useMockAuth ? "mock" : "demo")}.{Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(request.Email))}.jwt";
        var result = new AuthResult
        {
            Token = token,
            User = user
        };

        return Ok(result);
    }

    [HttpPost("logout")]
    public ActionResult Logout()
    {
        // In production with Entra ID, this would invalidate the token
        return Ok(new { message = "Logged out successfully" });
    }

    [HttpGet("me")]
    public async Task<ActionResult<User>> GetCurrentUser()
    {
        User? user;

        if (_useMockAuth)
        {
            user = SeedData.DemoUser;
        }
        else
        {
            // In production, this would validate the token and return the user
            // For demo purposes, we return the first user
            user = await _context.Users.FirstOrDefaultAsync();
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }
        }

        return Ok(user);
    }
}
