namespace QuizGame.Api.Models;

public class AnswerResult
{
    public bool IsCorrect { get; set; }
    public int Points { get; set; }
    public bool AllAnswered { get; set; }
    public Guid CorrectAnswerId { get; set; }
}
