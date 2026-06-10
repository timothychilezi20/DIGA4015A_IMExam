import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../assets/ABSALogo.png";

// ── Swap these URLs for your own images when ready ──────────────────────────
const SLIDES = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80", // city skyline
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80", // stock charts
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80", // professionals
  "https://images.unsplash.com/photo-1570126618953-d437176e8c79?w=1200&q=80", // Cape Town
];
// ────────────────────────────────────────────────────────────────────────────

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
    monthlyIncome: "",
    employmentStatus: "",
    province: "",
    financialGoal: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nextSlide, setNextSlide] = useState(1);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        setNextSlide((prev) => (prev + 1) % SLIDES.length);
        setFading(false);
      }, 1000); // matches CSS transition duration
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.age ||
      !form.monthlyIncome ||
      !form.employmentStatus ||
      !form.province ||
      !form.financialGoal
    ) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (Number(form.age) < 16 || Number(form.age) > 100) {
      setError("Please enter a valid age.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("absa_users") || "{}");
    if (users[form.email]) {
      setError("An account with this email already exists.");
      return;
    }

    const userData = {
      username: form.username,
      email: form.email,
      password: form.password,
      age: Number(form.age),
      monthlyIncome: Number(form.monthlyIncome),
      employmentStatus: form.employmentStatus,
      province: form.province,
      financialGoal: form.financialGoal,
    };

    users[form.email] = userData;
    localStorage.setItem("absa_users", JSON.stringify(users));
    localStorage.setItem("absa_current_user", JSON.stringify(userData));
    navigate("/");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    const users = JSON.parse(localStorage.getItem("absa_users") || "{}");
    const user = users[form.email];
    if (!user || user.password !== form.password) {
      setError("Invalid email or password.");
      return;
    }
    localStorage.setItem("absa_current_user", JSON.stringify(user));
    navigate("/");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setForm({
      username: "",
      email: "",
      password: "",
      age: "",
      monthlyIncome: "",
      employmentStatus: "",
      province: "",
      financialGoal: "",
    });
  };

  return (
    <div className="login-page">
      {/* Left panel — brand */}
      <div className="login-brand">
        {/* ── Slideshow layers ── */}
        <div
          className="login-slide login-slide--current"
          style={{
            backgroundImage: `url(${SLIDES[currentSlide]})`,
            opacity: fading ? 0 : 1,
          }}
        />
        <div
          className="login-slide login-slide--next"
          style={{ backgroundImage: `url(${SLIDES[nextSlide]})` }}
        />

        {/* ── Red gradient overlay ── */}
        <div className="login-brand-overlay" />

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
            <li>✦ Strategy tracks built for new earners</li>
            <li>✦ Simulate real financial decisions</li>
            <li>✦ Personalised wealth recommendations</li>
          </ul>
        </div>

        {/* Slide indicator dots */}
        <div className="login-slide-dots">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`login-slide-dot ${i === currentSlide ? "active" : ""}`}
            />
          ))}
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
              onClick={() => switchMode("login")}
            >
              Sign In
            </button>
            <button
              className={`login-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => switchMode("register")}
            >
              Register
            </button>
          </div>

          <h1 className="login-form-title">
            {mode === "login" ? "Welcome back" : "Let's get you set up"}
          </h1>
          <p className="login-form-subtitle">
            {mode === "login"
              ? "Sign in to continue your financial journey"
              : "A few details so we can personalise your experience"}
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
                  placeholder="e.g. thabo_m"
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

            {mode === "register" && (
              <>
                <div className="login-divider">
                  <span>About You</span>
                </div>

                <div className="login-row">
                  <div className="login-field">
                    <label htmlFor="age">Age</label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      placeholder="e.g. 24"
                      min="16"
                      max="100"
                      value={form.age}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="login-field">
                    <label htmlFor="monthlyIncome">
                      Monthly Take-home (ZAR)
                    </label>
                    <input
                      id="monthlyIncome"
                      name="monthlyIncome"
                      type="number"
                      placeholder="e.g. 28000"
                      min="0"
                      value={form.monthlyIncome}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="employmentStatus">
                    Where are you right now?
                  </label>
                  <select
                    id="employmentStatus"
                    name="employmentStatus"
                    value={form.employmentStatus}
                    onChange={handleChange}
                    className="login-select"
                  >
                    <option value="" disabled>
                      Select your situation
                    </option>
                    <option value="first-job">
                      Just Started My First Job (0–1 years)
                    </option>
                    <option value="early-career">
                      Early Career (1–3 years)
                    </option>
                    <option value="mid-career">Mid Career (3–5 years)</option>
                    <option value="self-employed">
                      Self-Employed / Freelance
                    </option>
                    <option value="still-studying">Still Studying</option>
                    <option value="student-job">
                      Studying + Working Part-Time
                    </option>
                    <option value="gap-year">
                      Taking a Gap / Between Jobs
                    </option>
                  </select>
                </div>

                <div className="login-field">
                  <label htmlFor="province">Province</label>
                  <select
                    id="province"
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className="login-select"
                  >
                    <option value="" disabled>
                      Select your province
                    </option>
                    <option value="gauteng">Gauteng</option>
                    <option value="western-cape">Western Cape</option>
                    <option value="kwazulu-natal">KwaZulu-Natal</option>
                    <option value="eastern-cape">Eastern Cape</option>
                    <option value="limpopo">Limpopo</option>
                    <option value="mpumalanga">Mpumalanga</option>
                    <option value="north-west">North West</option>
                    <option value="free-state">Free State</option>
                    <option value="northern-cape">Northern Cape</option>
                  </select>
                </div>

                <div className="login-field">
                  <label htmlFor="financialGoal">
                    What is your biggest money goal right now?
                  </label>
                  <select
                    id="financialGoal"
                    name="financialGoal"
                    value={form.financialGoal}
                    onChange={handleChange}
                    className="login-select"
                  >
                    <option value="" disabled>
                      Select your goal
                    </option>
                    <option value="stop-living-paycheque">
                      Stop Living Paycheque to Paycheque
                    </option>
                    <option value="buy-property">Buy My First Property</option>
                    <option value="start-investing">
                      Start Investing for the First Time
                    </option>
                    <option value="emergency-fund">
                      Build a Solid Emergency Fund
                    </option>
                    <option value="grow-globally">
                      Grow My Wealth Globally
                    </option>
                    <option value="retire-early">
                      Retire Early or Reach Financial Freedom
                    </option>
                    <option value="debt-free">
                      Pay Off Debt and Start Fresh
                    </option>
                  </select>
                </div>
              </>
            )}

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit">
              {mode === "login" ? "Sign In →" : "Create My Account →"}
            </button>
          </form>

          <p className="login-switch">
            {mode === "login" ? "New here? " : "Already have an account? "}
            <button
              className="login-switch-btn"
              onClick={() =>
                switchMode(mode === "login" ? "register" : "login")
              }
            >
              {mode === "login" ? "Create a free account" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
