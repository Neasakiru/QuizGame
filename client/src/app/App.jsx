import { SignalRProvider } from "../context/SignalRProvider";
import { GameProvider } from "../context/GameProvider";
import MainPage from "../pages/MainPage";
import AdminPage from "../pages/MainPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <SignalRProvider>
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/AdminPanel" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </SignalRProvider>
  );
}
