import { useParams } from "react-router-dom";
import { useGame } from "../context/GameProvider";

export default function WaitingView() {
  const { roomId } = useParams();
  const { connection } = useGame();

  const handleStart = async () => {
    await connection.invoke("StartGame", roomId);
  };

  return ( 
    <>
      <h1>Czekamy na rozpoczęcie gry...</h1>
      <button onClick={handleStart}>Start Game</button>
    </>
  )
}