import { createContext, useContext, useEffect, useState } from "react";
import { useSignalR } from "./SignalRProvider";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const connection = useSignalR();

  const [gameState, setGameState] = useState("Lobby");
  const [question, setQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (!connection) return;

    connection.on("state-updated", (state) => {
      setGameState(state.state);
      setQuestion(state.question);
      setLeaderboard(state.leaderboard ?? []);
    });

    return () => {
      connection.off("state-updated");
    };
  }, [connection]);

  return (
    <GameContext.Provider value={{
      gameState,
      question,
      leaderboard,
      connection
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);