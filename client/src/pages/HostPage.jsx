import { useParams } from "react-router-dom";
import { useGame } from "../context/GameProvider";
import { useState, useEffect } from "react";

export default function HostPage() {
  const { roomId } = useParams();
  const [lobby, setLobby] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { gameState, connection, question } = useGame();

  const handleStart = async () => {
    await connection.invoke("StartGame", roomId);
  };

  const fetchLobby = async () => {
    try {
      const response = await fetch(`https://localhost:7005/host/${roomId}`);

      if (!response.ok) {
        throw new Error("Nie udało się pobrać lobby");
      }

      const data = await response.json();
      setLobby(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomId) return;

    fetchLobby();

    const interval = setInterval(() => {
      fetchLobby();
    }, 2000); // co 2 sekundy

    return () => clearInterval(interval);
  }, [roomId]);

  const renderPlayers = () => {
    if (!lobby || !lobby.players || lobby.players.length === 0) {
      return <p>Brak graczy w lobby</p>;
    }

    return (
      <ul>
        {lobby.players.map((player) => (
          <li key={player.id}>
            {player.nickname} — {player.score} pkt
          </li>
        ))}
      </ul>
    );
  };

  if (gameState == "Waiting") {
    return (
      <>
        <h1>{roomId}</h1>
        <h1>Czekamy na rozpoczęcie gry...</h1>
        <button onClick={handleStart}>Start Game</button>
        {renderPlayers()}
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
