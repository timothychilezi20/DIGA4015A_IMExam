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
} from "lucide-react";

function StrategyTracker() {
  const { setSelectedTrack, updateTrackProgress, getTrackProgress } = useUser();

  const strategies = [
    {
      id: "first-property",
      title: "First Property Path",
      description: "Save for your first home within 5 years",
      icon: <Home size={28} />,
      featured: true,
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
      description: "Investing & Lifestyle Balance",
      icon: <Scale size={28} />,
      featured: false,
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
      description: "Diversify internationally",
      icon: <Globe size={28} />,
      featured: false,
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
        <h1 className="page-title">Strategy Tracker</h1>
        <p className="page-description">
          Choose your wealth-building path and track your progress towards
          financial freedom
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
              className={`strategy-card 
    ${strategy.featured ? "featured" : ""} 
    ${strategy.id === "global-investor" ? "global-investor" : ""}`}
            >
              {/* Recommended badge */}
              {strategy.featured && (
                <div className="featured-badge">Recommended</div>
              )}

              {strategy.id === "global-investor" && (
                <div className="featured-badge in-progress">In Progress</div>
              )}

              <div className="strategy-header">
                <div className="strategy-icon">{strategy.icon}</div>

                <div className="strategy-text">
                  <h3>{strategy.title}</h3>
                  <p>{strategy.description}</p>
                </div>
              </div>

              <div className="strategy-content">
                <div className="milestones">
                  <h4>
                    Milestones
                    <Tooltip content="Complete each milestone to progress on your wealth journey" />
                  </h4>

                  {strategy.milestones.map((milestone, idx) => (
                    <div key={idx} className="milestone-item">
                      <input
                        type="checkbox"
                        className="milestone-checkbox"
                        checked={localProgress[strategy.id]?.[idx] || false}
                        onChange={() => handleMilestoneToggle(strategy.id, idx)}
                      />
                      <span
                        className={`milestone-label ${
                          localProgress[strategy.id]?.[idx] ? "completed" : ""
                        }`}
                      >
                        {milestone.title}
                      </span>
                      <span className="milestone-year">{milestone.year}</span>
                    </div>
                  ))}
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>

                  <ProgressBar progress={progress} />

                  <div className="progress-meta">
                    {completedCount} of {strategy.milestones.length} milestones
                    completed
                  </div>
                </div>

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
