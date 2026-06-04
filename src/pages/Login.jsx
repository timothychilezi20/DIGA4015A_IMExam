import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../assets/ABSALogo.png";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setError("All fields are required for registration.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    //Save user data to localStorage
    const users = JSON.parse(localStorage.getItem("absa_users") || "{}");
    if (users[form.email]) {
      setError("An account with this email already exists.");
      return;
    }

    users[form.email] = {
      username: form.username,
      email: form.email,
      password: form.password,
    };
    localStorage.setItem("absa_users", JSON.stringify(users));

    //Log them in immediately after registration
    localStorage.setItem(
      "absa_current_user",
      JSON.stringify({ username: form.username, email: form.email }),
    );
    navigate("/");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email and password are required for login.");
      return;
    }

    //Check user credentials
    const users = JSON.parse(localStorage.getItem("absa_users") || "{}");
    const user = users[form.email];
    if (!user || user.password !== form.password) {
      setError("Invalid email or password.");
      return;
    }
    localStorage.setItem(
      "absa_current_user",
      JSON.stringify({ username: user.username, email: user.email }),
    );
    navigate("/");
  };

  return (
    <div className="login-page">
      {/* Left panel — brand */}
      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="login-logo">
            <img src={logo} alt="ABSA Logo" className="logo-image" />
            <span className="login-logo-sub">NextGen Wealth Studio</span>
          </div>
          <h2 className="login-brand-headline">
            Your wealth journey starts here.
          </h2>
          <p className="login-brand-body">
            Track your strategy, simulate financial decisions, and build a path
            to financial freedom — built for South African professionals.
          </p>
          <ul className="login-brand-features">
            <li>✦ Strategy track progress</li>
            <li>✦ Financial simulations</li>
            <li>✦ Personalised recommendations</li>
          </ul>
        </div>
        <div className="login-brand-orb login-brand-orb--1" />
        <div className="login-brand-orb login-brand-orb--2" />
      </div>

      {/* Right panel — form */}
      <div className="login-form-panel">
        <div className="login-form-inner">
          <div className="login-tabs">
            <button
              className={`login-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Sign In
            </button>
            <button
              className={`login-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Register
            </button>
          </div>

          <h1 className="login-form-title">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="login-form-subtitle">
            {mode === "login"
              ? "Sign in to continue your financial journey"
              : "Get started with your personalised strategy"}
          </p>

          <form
            className="login-form"
            onSubmit={mode === "login" ? handleLogin : handleRegister}
          >
            {mode === "register" && (
              <div className="login-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="e.g. john_doe"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
                <button
                  type="button"
                  className="login-show-password"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit">
              {mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          <p className="login-switch">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              className="login-switch-btn"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "Register" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
