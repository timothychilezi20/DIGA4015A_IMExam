import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import ProgressBar from "../components/Common/ProgressBar";
import Tooltip from "../components/Common/Tooltip";
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
} from "lucide-react";

function StrategyTracker() {
  const { setSelectedTrack, updateTrackProgress, getTrackProgress } = useUser();

  const strategies = [
    {
      id: "first-property",
      title: "First Property Path",
      description: "Save for your first home within 5 years",
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
        "Strike the perfect balance between living well and building wealth",
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
      description: "Expand your wealth beyond South African borders",
      image:
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
      icon: <Globe size={28} />,
      featured: false,
      inProgress: true,
      highlights: [
        { icon: <ShieldCheck size={16} />, text: "TFSA maximisation strategy" },
        { icon: <LineChart size={16} />, text: "Local & global ETF exposure" },
        {
          icon: <BadgeDollarSign size={16} />,
          text: "Currency diversification",
        },
        { icon: <RefreshCw size={16} />, text: "Long-term rebalancing plan" },
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

  const handleStartTrack = (strategyId) => {
    setSelectedTrack(strategyId);
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

      <div className="strategy-grid">
        {strategies.map((strategy) => {
          const progress = calculateProgress(strategy.id);
          const completedCount = strategy.milestones.filter(
            (_, i) => localProgress[strategy.id]?.[i],
          ).length;

          return (
            <div
              key={strategy.id}
              className={`strategy-card ${strategy.featured ? "featured" : ""} ${strategy.inProgress ? "in-progress-card" : ""}`}
            >
              {/* Full-card hero image */}
              <div
                className="strategy-hero"
                style={{ backgroundImage: `url(${strategy.image})` }}
              >
                <div className="strategy-hero-overlay" />

                <div className="strategy-hero-content">
                  {/* Badges */}
                  <div className="strategy-badges">
                    {strategy.featured && (
                      <span className="featured-badge">Recommended</span>
                    )}
                    {strategy.inProgress && (
                      <span className="featured-badge in-progress-badge">
                        In Progress
                      </span>
                    )}
                  </div>

                  {/* Title row — icon inline with heading */}
                  <div className="strategy-title-row">
                    <div className="strategy-hero-icon">{strategy.icon}</div>
                    <h3>{strategy.title}</h3>
                  </div>

                  <p className="strategy-hero-desc">{strategy.description}</p>

                  {/* Highlights with per-item icons */}
                  <ul className="strategy-highlights">
                    {strategy.highlights.map((point, i) => (
                      <li key={i}>
                        {point.icon}
                        {point.text}
                      </li>
                    ))}
                  </ul>

                  {/* Progress bar (if started) */}
                  {progress > 0 && (
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

                  {/* CTA — bottom-left, inline with icon feel */}
                  <div className="strategy-cta">
                    <a
                      href={`/first-property/${strategy.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="start-track-link"
                      onClick={() => handleStartTrack(strategy.id)}
                    >
                      <button className="start-track-btn">
                        {progress > 0 ? "Continue Track →" : "Start Track →"}
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational Sidebar */}
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
      </div>
    </div>
  );
}

export default StrategyTracker;
