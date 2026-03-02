import { SignalRProvider } from "../context/SignalRProvider";
import { GameProvider } from "../context/GameProvider";
import MainPage from "../pages/MainPage";
import AdminPage from "../pages/AdminPage";
import QuestionsPage from "../pages/QuestionsPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PlayPage from "../pages/PlayPage";
import HostPage from "../pages/HostPage";

export default function App() {
  return (
    <BrowserRouter>
      <SignalRProvider>
        <GameProvider>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/AdminPanel" element={<AdminPage />} />
            <Route path="/QuestionsPanel" element={<QuestionsPage />} />
            <Route path="/play/:roomId" element={<PlayPage />} />
            <Route path="/host/:roomId" element={<HostPage />} />
          </Routes>
        </GameProvider>
      </SignalRProvider>
    </BrowserRouter>
  );
}
