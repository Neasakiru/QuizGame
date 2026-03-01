using QuizGame.Api.Models;

namespace QuizGame.Api.Services;

public class LobbyService : ILobbyService
{
    private readonly List<Lobby> _lobbies = new();
    private readonly IQuestionService _questionService;

    public LobbyService(IQuestionService questionService)
    {
        _questionService = questionService;
    }

    public Lobby CreateLobby()
    {
        var lobby = new Lobby
        {
            Id = GenerateCode(),
            State = GameState.Waiting,
            CurrentQuestionIndex = 0,
            GameQuestions = new List<Question>()
        };

        _lobbies.Add(lobby);
        return lobby;
    }

    public Lobby? GetLobby(string id)
        => _lobbies.FirstOrDefault(l => l.Id == id);

    public Guid? JoinLobby(string id, string nickname)
    {
        var lobby = GetLobby(id);
        if (lobby == null) return null;
        if (lobby.State != GameState.Waiting) return null;
        if (string.IsNullOrWhiteSpace(nickname)) return null;
        if (lobby.Players.Any(p => p.Nickname.Equals(nickname, StringComparison.OrdinalIgnoreCase))) return null;

        var player = new Player
        {
            Id = Guid.NewGuid(),
            Nickname = nickname,
            Score = 0
        };

        lobby.Players.Add(player);
        return player.Id;
    }

    public bool LeaveLobby(string id, Guid playerId)
    {
        var lobby = GetLobby(id);
        if (lobby == null) return false;

        var player = lobby.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null) return false;

        lobby.Players.Remove(player);

        if (!lobby.Players.Any())
            _lobbies.Remove(lobby);

        return true;
    }

    public Question? StartGame(string id)
    {
        var lobby = GetLobby(id);
        if (lobby == null) return null;
        if (lobby.State != GameState.Waiting) return null;
        if (!lobby.Players.Any()) return null;

        var allQuestions = _questionService.GetAll()
            .Where(q => !string.IsNullOrWhiteSpace(q.Content) && q.Answers.Count == 4)
            .ToList();

        if (allQuestions.Count < 1) return null;

        lobby.GameQuestions = allQuestions
            .OrderBy(_ => Guid.NewGuid())
            .Take(Math.Min(5, allQuestions.Count))
            .ToList();

        lobby.CurrentQuestionIndex = 0;
        lobby.AnsweredPlayers.Clear();
        lobby.QuestionActive = true;
        lobby.QuestionStartTime = DateTime.UtcNow;

        foreach (var player in lobby.Players)
            player.Score = 0;

        lobby.State = GameState.InProgress;

        return StripCorrectAnswers(lobby.GameQuestions[0]);
    }

    public Question? GetCurrentQuestion(string id)
    {
        var lobby = GetLobby(id);
        if (lobby == null || lobby.State != GameState.InProgress) return null;
        if (lobby.CurrentQuestionIndex >= lobby.GameQuestions.Count) return null;

        return StripCorrectAnswers(lobby.GameQuestions[lobby.CurrentQuestionIndex]);
    }

    public AnswerResult? SubmitAnswer(string id, Guid playerId, Guid answerId)
    {
        var lobby = GetLobby(id);
        if (lobby == null || lobby.State != GameState.InProgress) return null;
        if (!lobby.QuestionActive) return null;

        var player = lobby.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null) return null;

        // Gracz już odpowiedział
        if (lobby.AnsweredPlayers.Contains(playerId)) return null;

        var question = lobby.GameQuestions[lobby.CurrentQuestionIndex];
        var correctAnswer = question.Answers.FirstOrDefault(a => a.IsCorrect);
        if (correctAnswer == null) return null;

        bool isCorrect = correctAnswer.Id == answerId;
        int points = 0;

        if (isCorrect)
        {
            // Punkty bazowe + bonus za szybkość
            var elapsed = (DateTime.UtcNow - lobby.QuestionStartTime!.Value).TotalSeconds;
            var timeRatio = Math.Max(0, 1.0 - elapsed / question.TimeLimitSeconds);
            points = 100 + (int)(timeRatio * 900); // 100 – 1000 pkt
            player.Score += points;
        }

        lobby.AnsweredPlayers.Add(playerId);

        bool allAnswered = lobby.Players.All(p => lobby.AnsweredPlayers.Contains(p.Id));

        return new AnswerResult
        {
            IsCorrect = isCorrect,
            Points = points,
            AllAnswered = allAnswered,
            CorrectAnswerId = correctAnswer.Id
        };
    }

    public Question? NextQuestion(string id)
    {
        var lobby = GetLobby(id);
        if (lobby == null || lobby.State != GameState.InProgress) return null;

        lobby.CurrentQuestionIndex++;
        lobby.AnsweredPlayers.Clear();
        lobby.QuestionActive = true;
        lobby.QuestionStartTime = DateTime.UtcNow;

        if (lobby.CurrentQuestionIndex >= lobby.GameQuestions.Count)
        {
            lobby.State = GameState.Finished;
            lobby.QuestionActive = false;
            return null;
        }

        return StripCorrectAnswers(lobby.GameQuestions[lobby.CurrentQuestionIndex]);
    }

    public List<ScoreEntry> GetScores(string id)
    {
        var lobby = GetLobby(id);
        if (lobby == null) return new();

        return lobby.Players
            .OrderByDescending(p => p.Score)
            .Select(p => new ScoreEntry { Nickname = p.Nickname, Score = p.Score })
            .ToList();
    }

    public bool EndGame(string id)
    {
        var lobby = GetLobby(id);
        if (lobby == null) return false;
        if (lobby.State != GameState.InProgress) return false;

        lobby.State = GameState.Finished;
        lobby.QuestionActive = false;
        return true;
    }

    // Zwraca kopię pytania BEZ flagi IsCorrect — gracze nie mogą znać odpowiedzi
    private static Question StripCorrectAnswers(Question q)
    {
        return new Question
        {
            Id = q.Id,
            Category = q.Category,
            Content = q.Content,
            TimeLimitSeconds = q.TimeLimitSeconds,
            Answers = q.Answers.Select(a => new Answer
            {
                Id = a.Id,
                Content = a.Content,
                IsCorrect = false // ukryte
            }).ToList()
        };
    }

    private string GenerateCode()
        => Guid.NewGuid().ToString()[..6].ToUpper();
}
