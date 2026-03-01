using System.Text.Json;
using QuizGame.Api.Models;

namespace QuizGame.Api.Services;

public class QuestionService : IQuestionService
{
    private readonly string _filePath = "Data/questions.json";
    private List<Question> _questions;

    public QuestionService()
    {
        if (!File.Exists(_filePath))
        {
            Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);
            File.WriteAllText(_filePath, "[]");
        }

        var json = File.ReadAllText(_filePath);
        _questions = JsonSerializer.Deserialize<List<Question>>(json) ?? new List<Question>();
    }

    public List<Question> GetAll()
    {
        return _questions;
    }

    public Question? GetById(Guid id)
    {
        return _questions.FirstOrDefault(q => q.Id == id);
    }

    public void Add(Question question)
    {
        if (question == null)
        {
            throw new ArgumentNullException(nameof(question));
        }

        ValidateQuestion(question);

        question.Id = Guid.NewGuid();

        foreach (var answer in question.Answers)
        {
            answer.Id = Guid.NewGuid();
        }

        _questions.Add(question);
        Save();
    }

    public void Update(Guid id, Question question)
    {
        if (question == null)
        {
            throw new ArgumentNullException(nameof(question));
        }

        ValidateQuestion(question);

        var existing = GetById(id);
        if (existing == null)
        {
            throw new ArgumentException("Question not found");
        }

        existing.Category = question.Category;
        existing.Content = question.Content;
        existing.Answers = question.Answers;

        foreach (var answer in existing.Answers)
        {
            if (answer.Id == Guid.Empty)
            {
                answer.Id = Guid.NewGuid();
            }
        }

        Save();
    }

    public void Delete(Guid id)
    {
        var existing = GetById(id);
        if (existing == null)
        {
            throw new ArgumentException("Question not found");
        }

        _questions.Remove(existing);
        Save();
    }

    private void Save()
    {
        var json = JsonSerializer.Serialize(_questions, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        File.WriteAllText(_filePath, json);
    }

    private void ValidateQuestion(Question question)
    {
        if (string.IsNullOrWhiteSpace(question.Content))
        {
            throw new ArgumentException("Question content cannot be empty");
        }

        if (question.Answers == null || question.Answers.Count != 4)
        {
            throw new ArgumentException("Question must have exactly 4 answers");
        }

        if (question.Answers.Count(a => a.IsCorrect) != 1)
        {
            throw new ArgumentException("Question must have exactly 1 correct answer");
        }

        if (question.Answers.Any(a => string.IsNullOrWhiteSpace(a.Content)))
        {
            throw new ArgumentException("Answer content cannot be empty");
        }
    }
}