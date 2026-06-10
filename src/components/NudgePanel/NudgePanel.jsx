import { useState, useEffect, useRef } from "react";
import { useNudges } from "../../hooks/useNudges";
import { Link } from "react-router-dom";
import {
  Lightbulb,
  TrendingUp,
  BookOpen,
  Flag,
  AlertTriangle,
  X,
  ChevronUp,
  ChevronDown,
  ArrowUpCircle,
} from "lucide-react";
import "./NudgePanel.css";

const TYPE_CONFIG = {
  opportunity: {
    icon: <TrendingUp size={14} />,
    label: "Opportunity",
    color: "#10B981",
    bg: "#10B98112",
    border: "#10B98130",
  },
  educational: {
    icon: <BookOpen size={14} />,
    label: "Learn",
    color: "#3B82F6",
    bg: "#3B82F612",
    border: "#3B82F630",
  },
  warning: {
    icon: <AlertTriangle size={14} />,
    label: "Action needed",
    color: "#F59E0B",
    bg: "#F59E0B12",
    border: "#F59E0B30",
  },
  milestone: {
    icon: <Flag size={14} />,
    label: "Milestone",
    color: "#a90c2b",
    bg: "#a90c2b12",
    border: "#a90c2b30",
  },
};

export default function NudgePanel() {
  const nudges = useNudges();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("absa_dismissed_nudges") || "[]");
    } catch {
      return [];
    }
  });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const panelRef = useRef(null);

  // Persist dismissals
  useEffect(() => {
    localStorage.setItem("absa_dismissed_nudges", JSON.stringify(dismissed));
  }, [dismissed]);

  // Back-to-top visibility
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const visible = nudges.filter((n) => !dismissed.includes(n.id));
  const warnings = visible.filter((n) => n.type === "warning").length;

  const dismiss = (id, e) => {
    e.stopPropagation();
    setDismissed((prev) => [...prev, id]);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* ── Floating launcher ────────────────────────────────────────── */}
      <div className="nudge-launcher-wrap" ref={panelRef}>
        <button
          className={`nudge-launcher ${warnings > 0 ? "nudge-launcher--warn" : ""}`}
          onClick={() => setIsOpen((o) => !o)}
          aria-label="Open nudge panel"
        >
          <Lightbulb size={20} />
          {visible.length > 0 && (
            <span className="nudge-badge">{visible.length}</span>
          )}
          <span className="nudge-launcher-label">
            Insights{" "}
            {isOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </span>
        </button>

        {/* ── Panel ──────────────────────────────────────────────────── */}
        {isOpen && (
          <div
            className="nudge-panel"
            role="dialog"
            aria-label="Financial insights"
          >
            <div className="nudge-panel-header">
              <div className="nudge-panel-title">
                <Lightbulb size={16} />
                <span>Your Insights</span>
              </div>
              <div className="nudge-panel-meta">
                {visible.length} active
                <button
                  className="nudge-close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="nudge-list">
              {visible.length === 0 ? (
                <div className="nudge-empty">
                  <Flag size={28} strokeWidth={1.4} />
                  <p>
                    You're all caught up. Check back after updating your profile
                    or running a simulation.
                  </p>
                </div>
              ) : (
                visible.map((nudge) => {
                  const cfg = TYPE_CONFIG[nudge.type];
                  return (
                    <div
                      key={nudge.id}
                      className="nudge-item"
                      style={{
                        background: cfg.bg,
                        borderColor: cfg.border,
                      }}
                    >
                      <div className="nudge-item-top">
                        <span
                          className="nudge-type-pill"
                          style={{ color: cfg.color, background: cfg.border }}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </span>
                        <button
                          className="nudge-dismiss"
                          onClick={(e) => dismiss(nudge.id, e)}
                          aria-label="Dismiss"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      <p className="nudge-title">{nudge.title}</p>
                      <p className="nudge-message">{nudge.message}</p>

                      {nudge.cta && nudge.ctaLink && (
                        <Link
                          to={nudge.ctaLink}
                          className="nudge-cta"
                          style={{ color: cfg.color, borderColor: cfg.border }}
                          onClick={() => setIsOpen(false)}
                        >
                          {nudge.cta} →
                        </Link>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {dismissed.length > 0 && (
              <button
                className="nudge-restore"
                onClick={() => setDismissed([])}
              >
                Restore {dismissed.length} dismissed insight
                {dismissed.length !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Back to top ──────────────────────────────────────────────── */}
      {showBackToTop && (
        <button
          className="back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ArrowUpCircle size={22} />
        </button>
      )}
    </>
  );
}
