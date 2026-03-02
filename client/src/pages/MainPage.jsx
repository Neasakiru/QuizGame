import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameProvider";
import "./aa_pageStyle.css";

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
      <div className="main-page">
        <div className="header">
          <Link to="/AdminPanel">Admin Panel</Link>
        </div>
        <div className="main">
          <div className="nickname">
            <input
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError("");
              }}
              placeholder="Twój nick"
              maxLength={20}
            />
          </div>
          <div className="control">
            <div className="join box">
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
              <button onClick={handleJoin}>Dołącz do gry</button>
            </div>
            <div className="host box">
              <button onClick={handleHost}>Stwórz grę</button>
            </div>
          </div>
        </div>
        <div className="footer">
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    </>
  );
}
