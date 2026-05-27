import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import ProgressBar from "../components/Common/ProgressBar";
import { formatCurrency } from "../utils/formatters";
import "./FirstProperty.css";

import {
  Home,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  PiggyBank,
  CreditCard,
  Wallet,
  Scale,
  Car,
  Clock,
  Utensils,
  Plane,
  Smartphone,
} from "lucide-react";

function FirstProperty() {
  const { trackId } = useParams();
  const { userProfile, updateTrackProgress, getTrackProgress } = useUser();
  const [trackProgress, setTrackProgress] = useState({});

  if (!userProfile) {
    return <div className="track-detail">Loading...</div>;
  }

  const tracks = {
    "first-property": {
      title: "First Property Path",
      description: "Save for your first home within 5 years",
      icon: <Home size={32} />,
      color: "#004C97",
      milestones: [
        {
          year: "Year 1",
          title: "Build Emergency Fund",
          description:
            "Save 3-6 months of living expenses before house hunting",
          target: `Target: ${formatCurrency(userProfile.monthlyIncome * 3)}`,
          action: "Start emergency fund",
        },
        {
          year: "Year 2-3",
          title: "Save for Deposit",
          description:
            "Save 10-20% for property deposit to avoid bond penalties",
          target: "Target: 10-20% of property value",
          action: "Open savings account",
        },
        {
          year: "Year 4",
          title: "Improve Credit Score",
          description: "Maintain good credit for better bond rates",
          target: "Target: Credit score above 650",
          action: "Check credit report",
        },
        {
          year: "Year 5",
          title: "Buy Your First Home",
          description: "Purchase property within budget",
          target: `Target: Under ${formatCurrency(userProfile.monthlyIncome * 48)}`,
          action: "Get pre-approval",
        },
      ],
      recommendations: [
        {
          title: "Monthly Savings Target",
          text: `Save ${formatCurrency(userProfile.monthlyIncome * 0.2)} monthly`,
        },
        {
          title: "Tax Benefits",
          text: "Transfer duty exemption under R1.1M",
        },
        {
          title: "Bond Comparison",
          text: "Compare at least 3 banks",
        },
      ],
      tradeoffs: [
        { icon: <Clock size={18} />, text: "Delayed luxury spending" },
        {
          icon: <TrendingDown size={18} />,
          text: "Reduced short-term investing",
        },
        { icon: <Home size={18} />, text: "Long-term location commitment" },
      ],
    },

    "balanced-lifestyle": {
      title: "Balanced Lifestyle & Investing",
      description: "Investing & Lifestyle Balance",
      icon: <Scale size={32} />,
      color: "#10B981",
      milestones: [
        {
          year: "Year 1",
          title: "50/30/20 Budget",
          description: "Balance income properly",
          target: "20% savings rate",
          action: "Create budget",
        },
        {
          year: "Year 2",
          title: "Auto-invest",
          description: "Set up automated investing",
          target: "R5,000+ monthly",
          action: "Set debit order",
        },
        {
          year: "Year 3",
          title: "Diversify",
          description: "Spread investments",
          target: "60/40 allocation",
          action: "Review portfolio",
        },
        {
          year: "Year 4-5",
          title: "Rebalance",
          description: "Annual optimisation",
          target: "8-10% returns",
          action: "Rebalance",
        },
      ],
      recommendations: [
        {
          title: "RA Contributions",
          text: `Contribute ${formatCurrency(userProfile.monthlyIncome * 0.275)}`,
        },
        {
          title: "TFSA First",
          text: "Max R36,000 annually",
        },
        {
          title: "Emergency Fund",
          text: `Keep ${formatCurrency(userProfile.monthlyIncome * 3)}`,
        },
      ],
      tradeoffs: [
        { icon: <Utensils size={18} />, text: "Less entertainment spending" },
        { icon: <Plane size={18} />, text: "Fewer luxury trips" },
        { icon: <Smartphone size={18} />, text: "Delayed upgrades" },
      ],
    },
  };

  const track = tracks[trackId];
  const savedProgress = getTrackProgress(trackId);

  useEffect(() => {
    if (track) {
      const initial = {};
      track.milestones.forEach((_, i) => {
        initial[i] = savedProgress?.[i] || false;
      });
      setTrackProgress(initial);
    }
  }, [trackId, track, savedProgress]);

  if (!track) {
    return (
      <div className="track-detail">
        <h1>Track not found</h1>
        <Link to="/strategy-tracker">Back</Link>
      </div>
    );
  }

  const toggle = (index) => {
    const updated = {
      ...trackProgress,
      [index]: !trackProgress[index],
    };
    setTrackProgress(updated);
    updateTrackProgress(trackId, index, updated[index]);
  };

  const completed = Object.values(trackProgress).filter(Boolean).length;
  const percent = (completed / track.milestones.length) * 100;

  return (
    <div className="track-detail">
      <button className="back-link" onClick={() => window.close()}>
        ← Back
      </button>

      <div className="track-header">
        <div className="track-title-row">
          <div className="track-icon">{track.icon}</div>
          <h1>{track.title}</h1>
        </div>

        <p className="track-description">{track.description}</p>
      </div>

      <div className="two-column-layout">
        {/* LEFT */}
        <div className="milestones-card">
          <h3>Your Journey</h3>

          <div className="progress-overview">
            <div className="progress-stats">
              <span className="progress-percentage">
                {Math.round(percent)}%
              </span>
              <span className="progress-label">
                {completed}/{track.milestones.length}
              </span>
            </div>
            <ProgressBar progress={percent} color={track.color} />
          </div>

          <div className="timeline">
            {track.milestones.map((m, i) => (
              <div key={i} className="timeline-item">
                <div
                  className={`timeline-dot ${trackProgress[i] ? "completed" : ""}`}
                />
                <div className="timeline-year">{m.year}</div>
                <div className="timeline-title">{m.title}</div>
                <div className="timeline-description">{m.description}</div>
                <div className="timeline-target">{m.target}</div>

                <button
                  className={`timeline-action ${trackProgress[i] ? "completed" : ""}`}
                  onClick={() => toggle(i)}
                >
                  {trackProgress[i] ? "Completed" : "Mark Complete"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div className="recommendations-card">
            <h3>Recommendations</h3>
            {track.recommendations.map((r, i) => (
              <div key={i} className="recommendation-item">
                <strong>{r.title}</strong>
                <p>{r.text}</p>
              </div>
            ))}
          </div>

          <div className="tradeoffs-card">
            <h3>Trade-offs</h3>
            {track.tradeoffs.map((t, i) => (
              <div key={i} className="tradeoff-item">
                <div className="tradeoff-icon">{t.icon}</div>
                <div className="tradeoff-text">{t.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FirstProperty;
