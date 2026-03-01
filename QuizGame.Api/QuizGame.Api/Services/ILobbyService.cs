using QuizGame.Api.Models;

namespace QuizGame.Api.Services;

public interface ILobbyService
{
    Lobby CreateLobby();
    Lobby? GetLobby(string id);

    /// <summary>Zwraca playerId lub null jeśli nie można dołączyć</summary>
    Guid? JoinLobby(string id, string nickname);
    bool LeaveLobby(string id, Guid playerId);

    /// <summary>Startuje grę i zwraca pierwsze pytanie (bez IsCorrect)</summary>
    Question? StartGame(string id);

    /// <summary>Bieżące pytanie bez IsCorrect</summary>
    Question? GetCurrentQuestion(string id);

    /// <summary>Przyjmuje odpowiedź gracza, zwraca wynik</summary>
    AnswerResult? SubmitAnswer(string id, Guid playerId, Guid answerId);

    /// <summary>Przechodzi do następnego pytania, zwraca je lub null jeśli koniec</summary>
    Question? NextQuestion(string id);

    List<ScoreEntry> GetScores(string id);

    bool EndGame(string id);
}
