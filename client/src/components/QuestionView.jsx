import { useGame } from "../context/GameProvider";

export default function QuestionView() {
  const { question, connection, playerId, roomId } = useGame();

  const answer = (answerId) => {
    connection.invoke("SubmitAnswer", roomId, playerId, answerId);
  };

  if (!question) return <p>Ładowanie pytania...</p>;

  return (
    <>
      <h2>{question.content}</h2>
      {question.answers.map((a) => (
        <button key={a.id} onClick={() => answer(a.id)}>
          {a.content}
        </button>
      ))}
    </>
  );
}