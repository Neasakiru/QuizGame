namespace QuizGame.Api.Models;

public class Player
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nickname { get; set; } = string.Empty;
    public int Score { get; set; }
}