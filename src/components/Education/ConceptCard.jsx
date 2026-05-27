import { useState } from "react";
import "./ConceptCard.css";

function ConceptCard({ title, description, icon, learnMore }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="concept-card">
      <div className="concept-header" onClick={() => setExpanded(!expanded)}>
        <div className="concept-icon">{icon}</div>
        <div className="concept-title">
          <h4>{title}</h4>
          <button className="expand-btn">{expanded ? "−" : "+"}</button>
        </div>
      </div>
      {expanded && (
        <div className="concept-content">
          <p>{description}</p>
          {learnMore && (
            <button className="learn-more-btn">Learn More →</button>
          )}
        </div>
      )}
    </div>
  );
}

export default ConceptCard;
