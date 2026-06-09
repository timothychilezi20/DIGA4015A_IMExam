import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import ProgressBar from "../components/Common/ProgressBar";
import "./StrategyTracker.css";
import "../styles/main.css";

import {
  Home,
  Scale,
  Globe,
  BarChart3,
  Target,
  TrendingUp,
  Flag,
  PiggyBank,
  CreditCard,
  KeyRound,
  Wallet,
  RefreshCw,
  LineChart,
  ShieldCheck,
  BadgeDollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function StrategyTracker() {
  const {
    userProfile,
    setSelectedTrack,
    updateTrackProgress,
    getTrackProgress,
  } = useUser();
  const [expandedCard, setExpandedCard] = useState(null);

  const strategies = [
    {
      id: "first-property",
      title: "First Property Path",
      description:
        "Specifically designed for young professionals who prioritize long-term stability and aim to purchase property within the next few years.",
      image:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
      icon: <Home size={22} />,
      featured: true,
      highlights: [
        { icon: <PiggyBank size={16} />, text: "Emergency fund foundation" },
        { icon: <Wallet size={16} />, text: "Deposit savings plan" },
        { icon: <CreditCard size={16} />, text: "Credit score optimisation" },
        { icon: <KeyRound size={16} />, text: "Bond application readiness" },
      ],
      priorities: [
        "Save consistently toward a property deposit",
        "Achieve stable income and affordability",
        "Reduce unnecessary expenses",
      ],
      avoidances: [
        "Spending recklessly on discretionary items",
        "Making large purchases on first income",
        "Taking on high-interest consumer debt",
      ],
      tradeoffs: [
        "Delayed luxury, travel and material purchases",
        "Limited spending flexibility in early years",
        "Gradual lifestyle increase — not immediate",
      ],
      milestones: [
        { year: "Year 1", title: "Build Emergency Fund" },
        { year: "Year 2-3", title: "Save for Deposit" },
        { year: "Year 4", title: "Improve Credit Score" },
        { year: "Year 5", title: "Buy Your First Home" },
      ],
    },
    {
      id: "balanced-lifestyle",
      title: "Balanced Lifestyle & Investing",
      description:
        "Strike the perfect balance between living well today and building lasting wealth for tomorrow.",
      image:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
      icon: <Scale size={28} />,
      featured: false,
      highlights: [
        { icon: <Wallet size={16} />, text: "50/30/20 budgeting framework" },
        { icon: <RefreshCw size={16} />, text: "Automated investment setup" },
        {
          icon: <LineChart size={16} />,
          text: "Diversified portfolio building",
        },
        { icon: <BarChart3 size={16} />, text: "Annual review & rebalance" },
      ],
      priorities: [
        "Maintain consistent savings rate of 20%+",
        "Automate investments to remove friction",
        "Build a diversified, low-cost portfolio",
      ],
      avoidances: [
        "Lifestyle inflation beyond 30% of income",
        "Neglecting retirement contributions",
        "Holding too much cash without investing",
      ],
      tradeoffs: [
        "Less entertainment and dining spending",
        "Fewer luxury trips in early years",
        "Delayed high-end upgrades (car, tech)",
      ],
      milestones: [
        { year: "Year 1", title: "50/30/20 Budget" },
        { year: "Year 2", title: "Auto-invest Setup" },
        { year: "Year 3", title: "Diversify Portfolio" },
        { year: "Year 4-5", title: "Review & Rebalance" },
      ],
    },
    {
      id: "global-investor",
      title: "Global Investor",
      description:
        "Expand your wealth beyond South African borders with a structured offshore exposure strategy.",
      image:
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
      icon: <Globe size={28} />,
      featured: false,
      highlights: [
        { icon: <ShieldCheck size={16} />, text: "TFSA maximisation strategy" },
        { icon: <LineChart size={16} />, text: "Local & global ETF exposure" },
        {
          icon: <BadgeDollarSign size={16} />,
          text: "Currency diversification",
        },
        { icon: <RefreshCw size={16} />, text: "Long-term rebalancing plan" },
      ],
      priorities: [
        "Maximise annual TFSA contributions first",
        "Build offshore exposure gradually",
        "Diversify across currencies and markets",
      ],
      avoidances: [
        "Overexposure to rand-denominated assets",
        "Speculative single-stock offshore bets",
        "Ignoring SARS reporting requirements",
      ],
      tradeoffs: [
        "Rand/dollar volatility can affect returns",
        "Requires a 7–10 year minimum horizon",
        "Less liquidity than local investments",
      ],
      milestones: [
        { year: "Year 1", title: "Open TFSA" },
        { year: "Year 2", title: "Invest in ETFs" },
        { year: "Year 3", title: "International Exposure" },
        { year: "Year 4-5", title: "Rebalance Portfolio" },
      ],
    },
  ];

  const [localProgress, setLocalProgress] = useState(() => {
    const saved = {};
    strategies.forEach((strategy) => {
      saved[strategy.id] = getTrackProgress(strategy.id);
    });
    return saved;
  });

  const handleMilestoneToggle = (strategyId, milestoneIndex) => {
    const currentStatus = localProgress[strategyId]?.[milestoneIndex];
    const newStatus = !currentStatus;
    setLocalProgress((prev) => ({
      ...prev,
      [strategyId]: {
        ...prev[strategyId],
        [milestoneIndex]: newStatus,
      },
    }));
    updateTrackProgress(strategyId, milestoneIndex, newStatus);
  };

  const calculateProgress = (strategyId) => {
    const strategy = strategies.find((s) => s.id === strategyId);
    if (!strategy) return 0;
    const completed = strategy.milestones.filter(
      (_, index) => localProgress[strategyId]?.[index],
    ).length;
    return (completed / strategy.milestones.length) * 100;
  };

  const getNudge = (strategyId) => {
    const progress = calculateProgress(strategyId);
    const savings = userProfile.savingsBalance || 0;
    const income = userProfile.monthlyIncome || 0;
    const monthlySavings = userProfile.monthlySavings || 0;

    if (strategyId === "first-property") {
      const depositTarget = income * 48 * 0.1;
      const monthsToDeposit =
        monthlySavings > 0
          ? Math.ceil((depositTarget - savings) / monthlySavings)
          : null;

      if (savings >= depositTarget)
        return {
          type: "success",
          message:
            "You've reached your deposit target. You're ready to apply for a bond.",
        };
      if (monthsToDeposit && monthsToDeposit <= 6)
        return {
          type: "warning",
          message: `You're ${monthsToDeposit} months away from your deposit goal. Keep going!`,
        };
      if (progress === 0)
        return {
          type: "info",
          message:
            "Start by building a 3-month emergency fund before house hunting.",
        };
      if (monthsToDeposit)
        return {
          type: "info",
          message: `At your current savings rate you could reach your deposit in ${Math.ceil(monthsToDeposit / 12)} year${Math.ceil(monthsToDeposit / 12) !== 1 ? "s" : ""}.`,
        };
    }

    if (strategyId === "balanced-lifestyle") {
      const savingsRate = income > 0 ? (monthlySavings / income) * 100 : 0;
      if (savingsRate >= 20)
        return {
          type: "success",
          message: `Your savings rate is ${Math.round(savingsRate)}% — you're hitting the 20% target.`,
        };
      if (savingsRate >= 10)
        return {
          type: "warning",
          message: `Your savings rate is ${Math.round(savingsRate)}%. Aim for 20% to stay on track.`,
        };
      return {
        type: "info",
        message:
          "Set up an automatic debit order to start building your savings rate.",
      };
    }

    if (strategyId === "global-investor") {
      const tfsaTarget = 36000;
      const annualSavings = monthlySavings * 12;
      if (annualSavings >= tfsaTarget)
        return {
          type: "success",
          message:
            "Your savings cover the full R36,000 TFSA allowance. Max it out first.",
        };
      return {
        type: "info",
        message: `You can contribute R${Math.min(annualSavings, tfsaTarget).toLocaleString()} of your R36,000 TFSA allowance this year.`,
      };
    }

    return null;
  };

  const handleStartTrack = (strategyId) => {
    setSelectedTrack(strategyId);
  };

  const toggleExpand = (strategyId) => {
    setExpandedCard((prev) => (prev === strategyId ? null : strategyId));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Strategy Tracks</h1>
        <p className="page-description">
          Choose your wealth-building path. Each track gives you a structured,
          expert-designed plan built for South African professionals.
        </p>
      </div>

      <div className="strategy-layout">
        {/* LEFT — cards */}
        <div className="strategy-grid">
          {strategies.map((strategy) => {
            const progress = calculateProgress(strategy.id);
            const completedCount = strategy.milestones.filter(
              (_, i) => localProgress[strategy.id]?.[i],
            ).length;
            const nudge = getNudge(strategy.id);
            const isExpanded = expandedCard === strategy.id;
            const isActive = progress > 0;

            return (
              <div
                key={strategy.id}
                className={`strategy-card ${strategy.featured ? "featured" : ""} ${isActive ? "is-active" : ""}`}
              >
                <div
                  className="strategy-hero"
                  style={{ backgroundImage: `url(${strategy.image})` }}
                >
                  <div className="strategy-hero-overlay" />

                  <div className="strategy-hero-content">
                    {/* Badges */}
                    <div className="strategy-badges">
                      {strategy.featured && (
                        <span className="badge badge--recommended">
                          Recommended
                        </span>
                      )}
                      {isActive && (
                        <span className="badge badge--active">In Progress</span>
                      )}
                    </div>

                    <div className="strategy-title-row">
                      <div className="strategy-hero-icon">{strategy.icon}</div>
                      <h3>{strategy.title}</h3>
                    </div>

                    <p className="strategy-hero-desc">{strategy.description}</p>

                    <ul className="strategy-highlights">
                      {strategy.highlights.map((point, i) => (
                        <li key={i}>
                          {point.icon}
                          {point.text}
                        </li>
                      ))}
                    </ul>

                    {/* Nudge */}
                    {nudge && (
                      <div className={`nudge nudge--${nudge.type}`}>
                        {nudge.type === "success" && <CheckCircle2 size={14} />}
                        {nudge.type === "warning" && <AlertCircle size={14} />}
                        {nudge.type === "info" && <AlertCircle size={14} />}
                        <span>{nudge.message}</span>
                      </div>
                    )}

                    {/* Progress */}
                    {isActive && (
                      <div className="strategy-progress-bar-wrap">
                        <div className="progress-header">
                          <span>
                            {completedCount} of {strategy.milestones.length}{" "}
                            milestones
                          </span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <ProgressBar progress={progress} />
                      </div>
                    )}

                    {/* CTA row */}
                    <div className="strategy-cta">
                      <a
                        href={`/first-property/${strategy.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="start-track-link"
                        onClick={() => handleStartTrack(strategy.id)}
                      >
                        <button className="start-track-btn">
                          {isActive ? "Continue Track →" : "Start Track →"}
                        </button>
                      </a>

                      <button
                        className="expand-btn"
                        onClick={() => toggleExpand(strategy.id)}
                      >
                        {isExpanded ? (
                          <>
                            Less detail <ChevronUp size={14} />
                          </>
                        ) : (
                          <>
                            More detail <ChevronDown size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable detail panel */}
                {isExpanded && (
                  <div className="strategy-detail-panel">
                    <div className="detail-columns">
                      <div className="detail-col">
                        <p className="detail-col-label">
                          <CheckCircle2 size={14} /> Priorities
                        </p>
                        <ul className="detail-list detail-list--green">
                          {strategy.priorities.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="detail-col">
                        <p className="detail-col-label">
                          <XCircle size={14} /> Avoidances
                        </p>
                        <ul className="detail-list detail-list--red">
                          {strategy.avoidances.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="detail-col">
                        <p className="detail-col-label">
                          <AlertCircle size={14} /> Trade-offs
                        </p>
                        <ul className="detail-list detail-list--amber">
                          {strategy.tradeoffs.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="milestone-strip">
                      {strategy.milestones.map((m, i) => (
                        <div
                          key={i}
                          className={`milestone-chip ${localProgress[strategy.id]?.[i] ? "milestone-chip--done" : ""}`}
                          onClick={() => handleMilestoneToggle(strategy.id, i)}
                        >
                          <span className="milestone-chip-year">{m.year}</span>
                          <span className="milestone-chip-title">
                            {m.title}
                          </span>
                          {localProgress[strategy.id]?.[i] && (
                            <CheckCircle2 size={12} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT — sidebar */}
        <div className="education-sidebar">
          <h3>Why Follow a Strategy Track?</h3>

          <div className="edu-tip">
            <div className="edu-header">
              <div className="edu-icon">
                <BarChart3 size={18} />
              </div>
              <strong>Structured Approach</strong>
            </div>
            <p>
              Breaking down big financial goals into smaller, achievable
              milestones keeps you motivated and on track.
            </p>
          </div>

          <div className="edu-tip">
            <div className="edu-header">
              <div className="edu-icon">
                <Target size={18} />
              </div>
              <strong>Clear Direction</strong>
            </div>
            <p>
              Each track is designed by financial experts specifically for South
              African professionals.
            </p>
          </div>

          <div className="edu-tip">
            <div className="edu-header">
              <div className="edu-icon">
                <TrendingUp size={18} />
              </div>
              <strong>Measurable Progress</strong>
            </div>
            <p>
              Track your completion rate and see how close you are to achieving
              each financial goal.
            </p>
          </div>

          <div className="edu-tip">
            <div className="edu-header">
              <div className="edu-icon">
                <Flag size={18} />
              </div>
              <strong>South African Context</strong>
            </div>
            <p>
              Strategies account for local factors like SARS regulations, RA tax
              benefits, and property market conditions.
            </p>
          </div>

          {/* Summary stats */}
          <div className="sidebar-stats">
            <p className="sidebar-stats-label">Your overall progress</p>
            {strategies.map((s) => {
              const p = calculateProgress(s.id);
              return (
                <div key={s.id} className="sidebar-stat-row">
                  <span className="sidebar-stat-name">{s.title}</span>
                  <div className="sidebar-stat-bar">
                    <div
                      className="sidebar-stat-fill"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                  <span className="sidebar-stat-pct">{Math.round(p)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StrategyTracker;
