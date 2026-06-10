import "./ProgressBar.css";

function ProgressBar({ progress, label, color = "var(--absa-red)" }) {
  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <div className="progress-bar-container">
      {(label || progress !== undefined) && (
        <div className="progress-bar-header">
          {label && <span className="progress-label">{label}</span>}
          <span className="progress-percentage">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
