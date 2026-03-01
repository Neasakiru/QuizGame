using QuizGame.Api.Hubs;
using QuizGame.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5005);
    options.ListenAnyIP(7005, listenOptions =>
    {
        listenOptions.UseHttps();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// SignalR
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddSingleton<IQuestionService, QuestionService>();
builder.Services.AddSingleton<ILobbyService, LobbyService>();

var app = builder.Build();

app.UseCors("FrontendPolicy");

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "QuizGame API v1");
    options.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();
app.MapControllers();

// SignalR hub
app.MapHub<GameHub>("/hub/game");

app.Run();
