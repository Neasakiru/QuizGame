import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useGame } from "../context/GameProvider";

import WaitingView from "../components/WaitingView";
import QuestionView from "../components/QuestionView";
import LeaderboardView from "../components/LeaderboardView";

export default function PlayPage() {
  const { roomId } = useParams();
  const { gameState, connection } = useGame();

  useEffect(() => {
    if (!connection) return;

    connection.invoke("JoinAsPlayer", roomId, "Player");
  }, [connection]);

  if (gameState === "Lobby")
    return <WaitingView />;

  if (gameState === "QuestionActive")
    return <QuestionView />;

  if (gameState === "Leaderboard")
    return <LeaderboardView />;

  return null;
}