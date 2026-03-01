namespace QuizGame.Api.Models;

public class Answer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Content { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}