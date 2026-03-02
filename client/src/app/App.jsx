import { SignalRProvider } from "../context/SignalRProvider";
import { GameProvider } from "../context/GameProvider";
import MainPage from "../pages/MainPage";
import AdminPage from "../pages/AdminPage";
import QuestionsPage from "../pages/QuestionsPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PlayPage from "../pages/PlayPage";

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
          </Routes>
        </GameProvider>
      </SignalRProvider>
    </BrowserRouter>
  );
}