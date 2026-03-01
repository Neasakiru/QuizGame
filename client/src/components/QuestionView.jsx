import { useGame } from "../context/GameProvider";

export default function QuestionView() {
  const { question, connection } = useGame();

  const answer = (index) => {
    connection.invoke("Answer", index);
  };

  return (
    <>
      {question.answers.map((a, i) => (
        <button key={i} onClick={() => answer(i)}>
          {a}
        </button>
      ))}
    </>
  );
}