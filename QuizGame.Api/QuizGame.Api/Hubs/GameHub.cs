using Microsoft.AspNetCore.SignalR;
using QuizGame.Api.Models;
using QuizGame.Api.Services;

namespace QuizGame.Api.Hubs;

public class GameHub : Hub
{
    private readonly ILobbyService _lobbyService;

    public GameHub(ILobbyService lobbyService)
    {
        _lobbyService = lobbyService;
    }

    /// <summary>Host tworzy nowe lobby. Zwraca gameId (6-znakowy kod).</summary>
    public async Task<string> CreateGame()
    {
        var lobby = _lobbyService.CreateLobby();
        await Groups.AddToGroupAsync(Context.ConnectionId, lobby.Id);
        return lobby.Id;
    }

    /// <summary>Host startuje grę. Wszyscy w grupie dostają pierwsze pytanie.</summary>
    public async Task StartGame(string gameId)
    {
        var question = _lobbyService.StartGame(gameId);
        if (question == null)
            throw new HubException("Nie można wystartować gry. Sprawdź czy są gracze i pytania.");

        await Clients.All.SendAsync("state-updated", "InProgress");
        await BroadcastQuestion(gameId, question);
    }

    /// <summary>Host ręcznie kończy grę przed czasem.</summary>
    public async Task EndGame(string gameId)
    {
        var success = _lobbyService.EndGame(gameId);
        if (!success)
            throw new HubException("Nie można zakończyć gry.");

        var scores = _lobbyService.GetScores(gameId);
        await Clients.Group(gameId).SendAsync("GameFinished", scores);
    }

    /// <summary>Gracz dołącza do lobby. Zwraca playerId.</summary>
    public async Task<Guid> JoinGame(string gameId, string nickname)
    {
        var playerId = _lobbyService.JoinLobby(gameId, nickname);
        if (playerId == null)
            throw new HubException("Nie można dołączyć. Sprawdź kod lobby lub czy nickname nie jest zajęty.");

        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        await Clients.All.SendAsync("PlayerJoined", nickname);
        await Clients.Group(gameId).SendAsync("state-updated", "Waiting");
        return playerId.Value;
    }

    /// <summary>Gracz wysyła odpowiedź.</summary>
    public async Task SubmitAnswer(string gameId, Guid playerId, Guid answerId)
    {
        var result = _lobbyService.SubmitAnswer(gameId, playerId, answerId);
        if (result == null)
            throw new HubException("Nie można przyjąć odpowiedzi.");

        // Tylko ten gracz widzi swój wynik (żeby inni nie widzieli czy dobrze)
        await Clients.Caller.SendAsync("AnswerResult", new
        {
            result.IsCorrect,
            result.Points,
            result.CorrectAnswerId
        });

        // Gdy wszyscy odpowiedzieli → pokaż wyniki rundy
        if (result.AllAnswered)
        {
            await EndRound(gameId);
        }
    }

    /// <summary>Host ręcznie przechodzi do następnego pytania (gdy np. timeout).</summary>
    public async Task ForceNextQuestion(string gameId)
    {
        await EndRound(gameId);
    }

    private async Task EndRound(string gameId)
    {
        var scores = _lobbyService.GetScores(gameId);
        await Clients.Group(gameId).SendAsync("RoundEnd", scores);

        // Krótka przerwa żeby gracze zobaczyli wyniki
        await Task.Delay(3000);

        var next = _lobbyService.NextQuestion(gameId);
        if (next != null)
        {
            await BroadcastQuestion(gameId, next);
        }
        else
        {
            await Clients.Group(gameId).SendAsync("GameFinished", scores);
        }
    }

    private async Task BroadcastQuestion(string gameId, Question question)
    {
        var lobby = _lobbyService.GetLobby(gameId);
        int total = lobby?.GameQuestions.Count ?? 0;
        int current = (lobby?.CurrentQuestionIndex ?? 0) + 1;

        await Clients.All.SendAsync("QuestionStarted", new
        {
            question.Id,
            question.Content,
            question.Category,
            question.TimeLimitSeconds,
            QuestionNumber = current,
            TotalQuestions = total,
            Answers = question.Answers.Select(a => new { a.Id, a.Content })
        });
    }
}
