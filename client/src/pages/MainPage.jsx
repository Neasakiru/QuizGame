import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function MainPage() {
  const [roomId, setRoomId] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!nickname.trim()) return setError('Wpisz nick przed dołączeniem.');
    if (!roomId.trim())   return setError('Wpisz kod gry.');
    navigate(`/play/${roomId.trim().toUpperCase()}`, { state: { nickname } });
  };

  return (
    <>
      <div>Hello</div>
      <input
        value={nickname}
        onChange={e => { setNickname(e.target.value); setError(''); }}
        placeholder="Twój nick"
        maxLength={20}
      />
      <input
        value={roomId}
        onChange={e => { setRoomId(e.target.value.toUpperCase()); setError(''); }}
        placeholder="Wpisz kod gry"
        maxLength={6}
        onKeyDown={e => e.key === 'Enter' && handleJoin()}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleJoin}>Dołącz do gry</button>
      <Link to="/AdminPanel">Admin Panel</Link>
    </>
  )
}