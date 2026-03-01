using Microsoft.AspNetCore.Mvc;
using QuizGame.Api.Models;
using QuizGame.Api.Services;

namespace QuizGame.Api.Controllers;

[ApiController]
[Route("api/questions")]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionService _service;

    public QuestionsController(IQuestionService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetAll()
        => Ok(_service.GetAll());

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        var q = _service.GetById(id);
        if (q == null) return NotFound();

        return Ok(q);
    }

    [HttpPost]
    public IActionResult Create([FromBody] Question question)
    {
        try
        {
            _service.Add(question);
            return Ok(question);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public IActionResult Update(Guid id, [FromBody] Question question)
    {
        _service.Update(id, question);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        _service.Delete(id);
        return NoContent();
    }
}