import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameProvider";

export default function MainPage() {
  const [roomId, setRoomId] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { connection } = useGame();

  const handleJoin = () => {
    if (!nickname.trim()) return setError("Wpisz nick przed dołączeniem.");
    if (!roomId.trim()) return setError("Wpisz kod gry.");
    navigate(`/play/${roomId.trim().toUpperCase()}`, { state: { nickname } });
  };

  const handleHost = async () => {
    try {
      const hostRoomId = await connection.invoke("CreateGame");
      console.log("roomId:", hostRoomId);
      navigate(`/host/${hostRoomId}`);
    } catch (err) {
      console.error("HostGame error:", err.message);
    }
  };

  return (
    <>
      <input
        value={nickname}
        onChange={(e) => {
          setNickname(e.target.value);
          setError("");
        }}
        placeholder="Twój nick"
        maxLength={20}
      />
      <input
        value={roomId}
        onChange={(e) => {
          setRoomId(e.target.value.toUpperCase());
          setError("");
        }}
        placeholder="Wpisz kod gry"
        maxLength={6}
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleJoin}>Dołącz do gry</button>
      <button onClick={handleHost}>Stwórz grę</button>
      <Link to="/AdminPanel">Admin Panel</Link>
    </>
  );
}
