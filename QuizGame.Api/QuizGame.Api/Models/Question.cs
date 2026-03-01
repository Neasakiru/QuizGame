namespace QuizGame.Api.Models;

public class Question
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Category { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public List<Answer> Answers { get; set; } = new();
    public int TimeLimitSeconds { get; set; } = 20;
}
