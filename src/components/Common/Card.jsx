import React from "react";
import "./Card.css";

function Card({
  children,
  title,
  icon,
  variant = "default",
  className = "",
  onClick,
  hoverable = true,
  footer,
  headerAction,
}) {
  const cardClasses = [
    "card",
    `card-${variant}`,
    hoverable ? "card-hoverable" : "",
    onClick ? "card-clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || icon || headerAction) && (
        <div className="card-header">
          <div className="card-header-left">
            {icon && <span className="card-icon">{icon}</span>}
            {title && <h3 className="card-title">{title}</h3>}
          </div>
          {headerAction && (
            <div className="card-header-action">{headerAction}</div>
          )}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

export const MetricCard = ({
  title,
  value,
  change,
  trend,
  icon,
  variant = "default",
}) => {
  const isPositive = trend == "up" || change > 0;
  const trendIcon = isPositive ? "▲" : "▼";
  const trendClass = isPositive ? "positive" : "negative";

  return (
    <Card variant={variant} icon={icon}>
      <div className="metric-card-content">
        <div className="metric-label">{title}</div>
        <div className="metric-value number">{value}</div>
        {change !== undefined && (
          <div className={`metric-change ${trendClass}`}>
            <span className="trend-icon">{trendIcon}</span>
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export const InfoCard = ({ title, content, icon, variant = "info" }) => {
  return (
    <Card variant={variant} icon={icon} title={title}>
      <p className="info-card-content">{content}</p>
    </Card>
  );
};

export const ProgressCard = ({ title, progress, subtitle, color, icon }) => {
  return (
    <Card title={title} icon={icon}>
      <div className="progress-card-content">
        <div className="progress-stats">
          <span className="progress-value number">{Math.round(progress)}%</span>
          {subtitle && <span className="progress-subtitle">{subtitle}</span>}
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              backgroundColor: color || "var(--absa-blue)",
            }}
          ></div>
        </div>
      </div>
    </Card>
  );
};

export default Card;
