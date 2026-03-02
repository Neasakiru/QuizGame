import { useGame } from "../context/GameProvider";

export default function LeaderboardView() {
  const { leaderboard } = useGame();

  return (
    <>
      <h1>Koniec gry!</h1>
      {leaderboard.map((entry, i) => (
        <div key={i}>
          <span>{i + 1}. {entry.nickname}</span>
          <span> - {entry.score} pkt</span>
        </div>
      ))}
    </>
  );
}