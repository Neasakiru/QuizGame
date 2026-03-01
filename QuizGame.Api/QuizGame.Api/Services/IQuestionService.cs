using QuizGame.Api.Models;

namespace QuizGame.Api.Services;

public interface IQuestionService
{
    List<Question> GetAll();
    Question? GetById(Guid id);
    void Add(Question question);
    void Update(Guid id, Question question);
    void Delete(Guid id);
}