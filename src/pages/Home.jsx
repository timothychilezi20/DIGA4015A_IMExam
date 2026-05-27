import { Wallet, Target, FlaskConical, Home as HomeIcon } from "lucide-react";

import { LineChart, Line, ResponsiveContainer } from "recharts";
import "../styles/main.css";
import "./Home.css";

function Home() {
  const expenseData = [
    { name: "Mon", value: 120 },
    { name: "Tue", value: 200 },
    { name: "Wed", value: 150 },
    { name: "Thu", value: 300 },
    { name: "Fri", value: 250 },
    { name: "Sat", value: 180 },
    { name: "Sun", value: 220 },
  ];

  return (
    <main className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome back, Timothy</h1>
          <p>
            Your personal financial intelligence platform. Track your money,
            build structured wealth strategies, and simulate better decisions.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>3</strong>
              <span>Active Paths</span>
            </div>

            <div className="hero-stat">
              <strong>85%</strong>
              <span>Financial Health</span>
            </div>

            <div className="hero-stat">
              <strong>R73K</strong>
              <span>Total Balance</span>
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
        {/* Spending Trend */}
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

          <p>Weekly spending pattern</p>
        </div>

        {/* Savings Growth */}
        <div className="preview-card">
          <h4>Savings Growth</h4>

          <ResponsiveContainer width="100%" height={90}>
            <LineChart
              data={[
                { name: "Mon", value: 100 },
                { name: "Tue", value: 130 },
                { name: "Wed", value: 160 },
                { name: "Thu", value: 190 },
                { name: "Fri", value: 220 },
              ]}
            >
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <p>Consistent upward growth</p>
        </div>

        {/* Financial Health */}
        <div className="preview-card">
          <h4>Financial Health</h4>

          <ResponsiveContainer width="100%" height={90}>
            <LineChart
              data={[
                { name: "M1", value: 70 },
                { name: "M2", value: 74 },
                { name: "M3", value: 78 },
                { name: "M4", value: 82 },
                { name: "M5", value: 85 },
              ]}
            >
              <Line
                type="monotone"
                dataKey="value"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <p>Improving overall score</p>
        </div>
      </section>
    </main>
  );
}

export default Home;
