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
  Globe,
  KeyRound,
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
      color: "#a90c2b",
      bannerImage:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
      educationalNote:
        "An emergency fund comes first because without it, any unexpected expense forces you to raid your deposit savings — resetting months of progress. Lenders also view a 6-month buffer as a sign of financial stability, which can meaningfully improve your bond approval odds and the rate you're offered.",
      warnings: [
        "Buying without a 10% deposit triggers NCA bond penalties — your monthly repayment could rise 12–18%.",
        "Transfer duty applies on properties above R1.1M. Budget an additional 3–8% of the purchase price for transfer and legal costs.",
      ],
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
      bannerImage:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
      educationalNote:
        "An emergency fund comes first because without it, any unexpected expense forces you to raid your deposit savings — resetting months of progress. Lenders also view a 6-month buffer as a sign of financial stability, which can meaningfully improve your bond approval odds and the rate you're offered.",
      warnings: [
        "Buying without a 10% deposit triggers NCA bond penalties — your monthly repayment could rise 12–18%.",
        "Transfer duty applies on properties above R1.1M. Budget an additional 3–8% of the purchase price for transfer and legal costs.",
      ],
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

    "global-investor": {
      title: "Global Investor",
      description: "Expand your wealth beyond the South African borders",
      icon: <Globe size={32} />,
      color: "#a90c2b",
      bannerImage:
        "https://cdn.corporatefinanceinstitute.com/assets/south-african-rand-1024x683.jpeg",
      milestones: [
        {
          year: "Year 1",
          title: "Open Tax-Free Savings Account & Emergency Fund",
          description:
            "Before investing globally, ensure that you have 3-6 months of expenses saved and your TFSA (Tax-Free Savings Account) set up for local tax-free growth.",
          target: `Target: ${formatCurrency(userProfile.monthlyIncome * 3)} in emergency fund and max out TFSA contributions`,
          action: "Open TSFA account",
        },

        {
          year: "Year 2",
          title: "Invest in Local ETFs",
          description:
            "Build a foundation with JSE-listed ETFs tracking the Top 40 and property indices before adding offshore exposure.",
          target: "Target: R5,000+ monthly into ETFs",
          action: "Buy first ETF",
        },
        {
          year: "Year 3",
          title: "Add International Exposure",
          description:
            "Use your R1M annual offshore investment allowance to invest in global index funds like the S&P 500 or MSCI World.",
          target: "Target: 30-40% of portfolio offshore",
          action: "Open global account",
        },
        {
          year: "Year 4",
          title: "Currency Diversification",
          description:
            "Hold assets in USD, EUR, and GBP to hedge against rand depreciation. Consider a forex account or feeder funds.",
          target: "Target: 3 currency exposure minimum",
          action: "Open forex account",
        },
        {
          year: "Year 5",
          title: "Rebalance & Optimise",
          description:
            "Annually review your local vs offshore split, rebalance to your target allocation, and harvest any tax losses.",
          target: "Target: 8-12% annualised returns",
          action: "Annual rebalance",
        },
      ],

      recommendations: [
        {
          title: "TFSA Maximisation",
          text: "Always contribute the full R36,000 annual TFSA allowance first — all growth is completely tax-free.",
        },
        {
          title: "Offshore Allowance",
          text: "SARS allows R1M per year offshore without tax clearance. Use a reputable platform like EasyEquities USD.",
        },
        {
          title: "Rand Hedge ETFs",
          text: "JSE-listed ETFs like Satrix MSCI World give offshore exposure without moving money out of SA.",
        },
        {
          title: "RA for Tax Relief",
          text: `Contribute ${formatCurrency(userProfile.monthlyIncome * 0.275)} monthly to an RA and deduct up to 27.5% of income from tax.`,
        },
      ],
      tradeoffs: [
        {
          icon: <TrendingDown size={18} />,
          text: "Rand/dollar volatility can cut returns when converting back",
        },
        {
          icon: <Clock size={18} />,
          text: "Global investing requires a long horizon of 7-10+ years",
        },
        {
          icon: <Wallet size={18} />,
          text: "Less liquidity — offshore funds can take days to settle",
        },
        {
          icon: <AlertTriangle size={18} />,
          text: "Tax implications on foreign dividends — declare to SARS annually",
        },
      ],
    },
  };

  const track = tracks[trackId];
  const savedProgress = getTrackProgress(trackId);

  useEffect(() => {
    if (!track) return;

    const initial = {};

    track.milestones.forEach((_, i) => {
      initial[i] = savedProgress?.[i] || false;
    });

    setTrackProgress((prev) => {
      const same = JSON.stringify(prev) === JSON.stringify(initial);

      return same ? prev : initial;
    });
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
    <div>
      {/* Banner outside the padded container */}
      <div className="track-banner">
        <img src={track.bannerImage} alt={`${track.title} banner`} />
        <div className="track-banner-overlay" />

        <div className="track-banner-text">
          <button className="back-link" onClick={() => window.close()}>
            ← Back
          </button>

          <div className="track-title-row">
            <div className="track-icon">{track.icon}</div>
            <h1>{track.title}</h1>
          </div>
          <p className="track-description">{track.description}</p>
        </div>
      </div>

      <div className="track-detail">
        <div className="two-column-layout">
          {/* LEFT */}
          <div className="milestones-card">
            <h3>Your Journey</h3>

            <div className="progress-overview">
              <div className="progress-stats">
                <span className="progress-label">Overall progress</span>
                <span className="progress-percentage">
                  {completed}{" "}
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--neutral-500)",
                      fontWeight: 400,
                    }}
                  >
                    / {track.milestones.length} milestones
                  </span>
                </span>
              </div>
              <ProgressBar progress={percent} color={track.color} />
              <div className="progress-subline">
                <span>{Math.round(percent)}% complete</span>
                <span>{track.milestones.length - completed} remaining</span>
              </div>
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

              {track.educationalNote && (
                <div className="edu-panel">
                  <h3>
                    <Lightbulb size={16} />
                    Why this order matters
                  </h3>
                  <p>{track.educationalNote}</p>
                </div>
              )}
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
    </div>
  );
}

export default FirstProperty;
