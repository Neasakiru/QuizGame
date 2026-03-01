namespace QuizGame.Api.Models;

public class Lobby
{
    public string Id { get; set; } = string.Empty;
    public List<Player> Players { get; set; } = new();
    public GameState State { get; set; } = GameState.Waiting;

    public List<Question> GameQuestions { get; set; } = new();
    public int CurrentQuestionIndex { get; set; } = 0;

    public bool QuestionActive { get; set; }
    public DateTime? QuestionStartTime { get; set; }

    // Kto już odpowiedział na bieżące pytanie (playerId)
    public HashSet<Guid> AnsweredPlayers { get; set; } = new();
}
