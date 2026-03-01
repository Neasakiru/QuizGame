using Microsoft.AspNetCore.Mvc;
using QuizGame.Api.Services;

namespace QuizGame.Api.Controllers;

[ApiController]
[Route("game")]
public class GameController : ControllerBase
{
    private readonly ILobbyService _lobbyService;

    public GameController(ILobbyService lobbyService)
    {
        _lobbyService = lobbyService;
    }

    /// <summary>Sprawdź czy lobby istnieje i jaki ma stan.</summary>
    [HttpGet("{id}")]
    public IActionResult GetGame(string id)
    {
        var lobby = _lobbyService.GetLobby(id);
        if (lobby == null) return NotFound("Lobby nie istnieje");

        return Ok(new
        {
            lobby.Id,
            lobby.State,
            PlayerCount = lobby.Players.Count
        });
    }

    /// <summary>Pobierz aktualne pytanie (bez poprawnej odpowiedzi).</summary>
    [HttpGet("{id}/question")]
    public IActionResult GetCurrentQuestion(string id)
    {
        var question = _lobbyService.GetCurrentQuestion(id);
        if (question == null) return NotFound("Brak aktywnego pytania");

        return Ok(question);
    }

    [HttpPost("{id}/leave/{playerId}")]
    public IActionResult LeaveGame(string id, Guid playerId)
    {
        var success = _lobbyService.LeaveLobby(id, playerId);
        if (!success) return BadRequest("Nie można opuścić lobby");

        return Ok();
    }
}
