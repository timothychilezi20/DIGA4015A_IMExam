import { useState } from "react";
import "./Tooltip.css";

function Tooltip({ content, children }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className="tooltip-trigger">ⓘ</span>
      {children}
      {isVisible && <div className="tooltip-content">{content}</div>}
    </div>
  );
}

export default Tooltip;
