import { useParams } from "react-router-dom";
import { useGame } from "../context/GameProvider";

export default function HostPage() {
  const { roomId } = useParams();
  const { gameState, connection, question } = useGame();

  const handleStart = async () => {
    await connection.invoke("StartGame", roomId);
  };

  if (gameState == "Waiting") {
    return (
      <>
        <h1>{roomId}</h1>
        <h1>Czekamy na rozpoczęcie gry...</h1>
        <button onClick={handleStart}>Start Game</button>
      </>
    );
  }

  if (gameState == "InProgress" && !question) {
    return <h2>Ładowanie pytania</h2>;
  }

  if (gameState == "InProgress") {
    return <h2>{question.content}</h2>;
  }
}
