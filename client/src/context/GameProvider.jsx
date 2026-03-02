import { createContext, useContext, useEffect, useState } from "react";
import { useSignalR } from "./SignalRProvider";

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const { connection, isReady } = useSignalR();

  const [gameState, setGameState] = useState("Waiting");
  const [question, setQuestion] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (!connection || !isReady) return;

    connection.on("state-updated", (state) => {
      setGameState(state);
    });

    connection.on("QuestionStarted", (q) => {
      setQuestion(q);
    });

    connection.on("GameFinished", (scores) => {
      setLeaderboard(scores);
      setGameState("Finished");
    });

    return () => {
      connection.off("state-updated");
      connection.off("QuestionStarted");
      connection.off("GameFinished");
    };
  }, [connection, isReady]);

  return (
    <GameContext.Provider value={{
      gameState, question, connection, isReady,
      playerId, setPlayerId,
      roomId, setRoomId,
      leaderboard
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
};