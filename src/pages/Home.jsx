import { Wallet, Target, FlaskConical, TrendingUp } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import "../styles/main.css";
import "./Home.css";

function Home() {
  const { userProfile, getTrackProgress, healthScore, netWorth, snapshots } =
    useUser();

  const trackIds = ["first-property", "balanced-lifestyle", "global-investor"];
  const activePaths = trackIds.filter((id) => {
    const p = getTrackProgress(id);
    return p && Object.values(p).some(Boolean);
  }).length;

  const formatZAR = (amount) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(amount);

  const toChartData = (key, currentValue) => {
    if (snapshots.length >= 2) {
      return snapshots.slice(-6).map((s, i) => ({
        name: `M${i + 1}`,
        value: s[key] ?? currentValue,
      }));
    }
    return [{ name: "Now", value: currentValue }];
  };

  const expenseData = toChartData("expenses", userProfile.monthlyExpenses);
  const savingsData = toChartData("savings", userProfile.savingsBalance);
  const healthData = toChartData("health", healthScore);

  return (
    <main className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome back, {userProfile.firstName}</h1>
          <p>
            Your personal financial intelligence platform. Track your money,
            build structured wealth strategies, and simulate better decisions.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>{activePaths}</strong>
              <span>Active Paths</span>
            </div>
            <div className="hero-stat">
              <strong>{Math.round(healthScore)}%</strong>
              <span>Financial Health</span>
            </div>
            <div className="hero-stat">
              <strong>{formatZAR(netWorth)}</strong>
              <span>Net Worth</span>
            </div>
          </div>
        </div>
      </section>

      {/* SUMMARY STRIP */}
      <section className="financial-summary">
        <div className="summary-card">
          <span className="summary-label">Monthly Income</span>
          <strong>{formatZAR(userProfile.monthlyIncome)}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Monthly Expenses</span>
          <strong>{formatZAR(userProfile.monthlyExpenses)}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Savings Balance</span>
          <strong>{formatZAR(userProfile.savingsBalance)}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Monthly Savings</span>
          <strong>{formatZAR(userProfile.monthlySavings)}</strong>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="features">
        <h2>Explore Your Dashboard</h2>
        <div className="feature-grid">
          <div className="feature-card money">
            <Wallet size={26} />
            <h3>Money Snapshot</h3>
            <div className="feature-stats">
              <span>Income: {formatZAR(userProfile.monthlyIncome)}</span>
              <span>Expenses: {formatZAR(userProfile.monthlyExpenses)}</span>
              <span>Savings: {formatZAR(userProfile.savingsBalance)}</span>
            </div>
            <a href="/money-snapshot" className="btn">
              View Details
            </a>
          </div>

          <div className="feature-card strategy">
            <Target size={26} />
            <h3>Strategy Tracker</h3>
            <div className="feature-stats">
              <span>{activePaths} Active Paths</span>
              <span>Health Score: {Math.round(healthScore)}%</span>
            </div>
            <a href="/strategy-tracker" className="btn">
              Continue
            </a>
          </div>

          <div className="feature-card simulation">
            <FlaskConical size={26} />
            <h3>Simulation Lab</h3>
            <div className="feature-stats">
              <span>Explore future scenarios</span>
              <span>Compare investment outcomes</span>
            </div>
            <a href="/simulation-lab" className="btn">
              Launch
            </a>
          </div>
        </div>
      </section>

      {/* STRATEGY PROGRESS */}
      <section className="progress-section">
        <h2>Strategy Progress</h2>
        {trackIds.map((id) => {
          const progress = getTrackProgress(id);
          if (!progress) return null;
          const completed = Object.values(progress).filter(Boolean).length;
          const total = Object.keys(progress).length;
          const percentage = Math.round((completed / total) * 100);
          return (
            <div key={id} className="progress-item">
              <div className="progress-text">
                <span>{id.replace(/-/g, " ")}</span>
                <span>{percentage}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* CONTEXT */}
      <section className="context">
        <h2>Build Wealth With Clarity</h2>
        <p>
          Financial success is not just about earning more — it is about
          building systems that guide your decisions and long-term behaviour.
        </p>
        <div className="context-grid">
          <div className="context-item">
            <Wallet size={18} />
            <span>Track spending clearly</span>
          </div>
          <div className="context-item">
            <Target size={18} />
            <span>Follow guided strategies</span>
          </div>
          <div className="context-item">
            <TrendingUp size={18} />
            <span>Visualise financial growth</span>
          </div>
        </div>
      </section>

      {/* MINI CHART PREVIEWS */}
      <section className="preview-strip">
        {/* Expenses chart — fixed: was raw JS text in JSX */}
        <div className="preview-card">
          <h4>Monthly Expenses</h4>
          {expenseData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={90}>
              <LineChart data={expenseData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-placeholder">
              <span>{formatZAR(userProfile.monthlyExpenses)}</span>
              <p>Trend builds as you update your snapshot</p>
            </div>
          )}
          <p>Current: {formatZAR(userProfile.monthlyExpenses)}</p>
        </div>

        {/* Savings chart */}
        <div className="preview-card">
          <h4>Savings Balance</h4>
          {savingsData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={90}>
              <LineChart data={savingsData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-placeholder">
              <span>{formatZAR(userProfile.savingsBalance)}</span>
              <p>Trend builds as you update your snapshot</p>
            </div>
          )}
          <p>Current: {formatZAR(userProfile.savingsBalance)}</p>
        </div>

        {/* Simulation preview */}
        <div className="preview-card">
          <h4>Simulation Lab</h4>
          <div className="preview-sim-content">
            <FlaskConical size={28} strokeWidth={1.5} />
            <ul>
              <li>Buy a property</li>
              <li>Increase savings rate</li>
              <li>Change investment allocation</li>
            </ul>
          </div>
          <p>Explore future outcomes before making decisions.</p>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="quick-actions">
        <a href="/money-snapshot" className="action-card">
          Update Budget
        </a>
        <a href="/strategy-tracker" className="action-card">
          Continue Strategy
        </a>
        <a href="/simulation-lab" className="action-card">
          Run Simulation
        </a>
      </section>
    </main>
  );
}

export default Home;
