import "./ProgressBar.css";

function ProgressBar({ progress, label, color = "var(--absa-blue)" }) {
  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <div className="progress-bar-container">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <div className="progress-percentage">{Math.round(percentage)}%</div>
    </div>
  );
}

export default ProgressBar;
