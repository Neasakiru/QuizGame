import { useParams, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useGame } from "../context/GameProvider";

import WaitingView from "../components/WaitingView";
import QuestionView from "../components/QuestionView";
import LeaderboardView from "../components/LeaderboardView";

export default function PlayPage() {
  const { roomId } = useParams();
  const { state } = useLocation();
  const nickname = state?.nickname;
  const { gameState, connection, isReady, setPlayerId, setRoomId } = useGame();

  const joinedRef = useRef(false);

  useEffect(() => {
    if (!connection || !isReady || !nickname) return;
    if (joinedRef.current) return;
    joinedRef.current = true;

    const join = async () => {
      try {
        const id = await connection.invoke("JoinGame", roomId, nickname);
        setPlayerId(id);
        setRoomId(roomId);
        console.log("playerId:", id);
      } catch (err) {
        console.error("JoinGame error:", err.message);
      }
    };

    join();
  }, [connection, isReady]);

  if (gameState === "Waiting")
    return <WaitingView />;

  if (gameState === "InProgress")
    return <QuestionView />;

  if (gameState === "Finished")
    return <LeaderboardView />;

  return null;
}