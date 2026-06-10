import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { useNudges } from "./hooks/useNudges";
import Navigation from "./components/Layout/Navigation";
import Footer from "./components/Layout/Footer";
import Home from "./pages/Home";
import MoneySnapshot from "./pages/MoneySnapshot";
import StrategyTracker from "./pages/StrategyTracker";
import SimulationLab from "./pages/SimulationLab";
import FirstProperty from "./pages/FirstProperty";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import BackToTop from "./components/Layout/BackToTop";
import NudgePanel from "./components/NudgePanel/NudgePanel";
import "./App.css";

// This is what any route that requires a logged in user.
// If there is no session found, then it redirects to the login page.
function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("absa_current_user"));
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isFirstPropertyPage = location.pathname.startsWith("/first-property");
  const hideChrome = isLoginPage || isFirstPropertyPage;

  return (
    <>
      {!hideChrome && <Navigation />}

      <main className="main-content">
        <Routes>
          {/* Public routes  */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/money-snapshot"
            element={
              <ProtectedRoute>
                <MoneySnapshot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/strategy-tracker"
            element={
              <ProtectedRoute>
                <StrategyTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/first-property/:trackId"
            element={
              <ProtectedRoute>
                <FirstProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulation-lab"
            element={
              <ProtectedRoute>
                <SimulationLab />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<Profile />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!hideChrome && <Footer />}
      {!hideChrome && <BackToTop />}
      {!hideChrome && <NudgePanel />}
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
