import { Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import Navigation from "./components/Layout/Navigation";
import Footer from "./components/Layout/Footer";
import Home from "./pages/Home";
import MoneySnapshot from "./pages/MoneySnapshot";
import StrategyTracker from "./pages/StrategyTracker";
import SimulationLab from "./pages/SimulationLab";
import FirstProperty from "./pages/FirstProperty";
import "./App.css";

function AppLayout() {
  const location = useLocation();
  const isFirstPropertyPage = location.pathname.startsWith("/first-property");

  return (
    <>
      {!isFirstPropertyPage && <Navigation />}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/money-snapshot" element={<MoneySnapshot />} />
          <Route path="/strategy-tracker" element={<StrategyTracker />} />
          <Route path="/first-property/:trackId" element={<FirstProperty />} />
          <Route path="/simulation-lab" element={<SimulationLab />} />
        </Routes>
      </main>

      {!isFirstPropertyPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <AppLayout />
    </UserProvider>
  );
}

export default App;
