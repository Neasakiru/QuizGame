using Microsoft.AspNetCore.Mvc;
using QuizGame.Api.Services;

namespace QuizGame.Api.Controllers;

[ApiController]
[Route("host")]
public class HostController : ControllerBase
{
    private readonly ILobbyService _lobbyService;

    public HostController(ILobbyService lobbyService)
    {
        _lobbyService = lobbyService;
    }

    /// <summary>Utwórz nowe lobby. Zwraca obiekt Lobby z Id.</summary>
    [HttpPost]
    public IActionResult CreateGame()
    {
        var lobby = _lobbyService.CreateLobby();
        return Ok(new { lobby.Id, lobby.State });
    }

    /// <summary>Pobierz informacje o lobby (gracze, stan, numer pytania).</summary>
    [HttpGet("{id}")]
    public IActionResult GetLobby(string id)
    {
        var lobby = _lobbyService.GetLobby(id);
        if (lobby == null) return NotFound();

        return Ok(new
        {
            lobby.Id,
            lobby.State,
            Players = lobby.Players.Select(p => new { p.Id, p.Nickname, p.Score }),
            CurrentQuestion = lobby.CurrentQuestionIndex + 1,
            TotalQuestions = lobby.GameQuestions.Count
        });
    }

    /// <summary>Aktualne wyniki.</summary>
    [HttpGet("{id}/scores")]
    public IActionResult GetScores(string id)
    {
        var scores = _lobbyService.GetScores(id);
        return Ok(scores);
    }
}
