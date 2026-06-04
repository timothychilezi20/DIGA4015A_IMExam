import { Wallet, Target, FlaskConical } from "lucide-react";
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
      return snapshots.map((s, i) => ({
        name: `M${i + 1}`,
        value: s[key],
      }));
    }

    return [1, 2, 3, 4, 5].map((m) => ({
      name: `M${m}`,
      value: currentValue,
    }));
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

      {/* FEATURE CARDS */}
      <section className="features">
        <h2>Explore Your Dashboard</h2>

        <div className="feature-grid">
          <div className="feature-card money">
            <Wallet size={26} />
            <h3>Money Snapshot</h3>
            <p>Track income, expenses, and savings in real time.</p>
            <a href="/money-snapshot" className="btn">
              Open
            </a>
          </div>

          <div className="feature-card strategy">
            <Target size={26} />
            <h3>Strategy Tracker</h3>
            <p>Follow structured financial paths toward your goals.</p>
            <a href="/strategy-tracker" className="btn">
              Open
            </a>
          </div>

          <div className="feature-card simulation">
            <FlaskConical size={26} />
            <h3>Simulation Labs</h3>
            <p>Test financial decisions before making real commitments.</p>
            <a href="/simulation-lab" className="btn">
              Open
            </a>
          </div>
        </div>
      </section>

      {/* CONTEXT SECTION */}
      <section className="context">
        <h2>Build Wealth With Clarity</h2>
        <p>
          Financial success is not just about earning more, it is about building
          systems that guide your decisions and long-term behaviour.
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
            <Target size={18} />
            <span>Visualise financial growth</span>
          </div>
        </div>
      </section>

      {/* MINI CHART PREVIEWS */}
      <section className="preview-strip">
        <div className="preview-card">
          <h4>Spending Trend</h4>
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
          <p>Monthly expenses: {formatZAR(userProfile.monthlyExpenses)}</p>
        </div>

        <div className="preview-card">
          <h4>Savings Growth</h4>
          <ResponsiveContainer width="100%" height={90}>
            <LineChart data={savingsData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <p>Current Balance: {formatZAR(userProfile.savingsBalance)}</p>
        </div>

        <div className="preview-card">
          <h4>Financial Health</h4>
          <ResponsiveContainer width="100%" height={90}>
            <LineChart data={healthData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <p>Current Score: {Math.round(healthScore)}</p>
        </div>
      </section>
    </main>
  );
}

export default Home;
