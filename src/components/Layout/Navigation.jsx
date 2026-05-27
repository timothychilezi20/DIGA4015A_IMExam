import { NavLink } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/ABSA_Group_Limited_Logo.svg.png";
import {
  Home,
  Wallet,
  Target,
  FlaskConical,
  User,
  Menu,
  X,
} from "lucide-react";

import "./Navigation.css";

function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: <Home size={18} /> },
    {
      path: "/money-snapshot",
      label: "Money Snapshot",
      icon: <Wallet size={18} />,
    },
    {
      path: "/strategy-tracker",
      label: "Strategy Tracker",
      icon: <Target size={18} />,
    },
    {
      path: "/simulation-lab",
      label: "Simulation Lab",
      icon: <FlaskConical size={18} />,
    },
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/* BRAND */}
        <div className="nav-brand">
          <div className="logo">
            {/* Replace with actual logo file */}
            <img src={logo} alt="ABSA Logo" className="logo-image" />
            <span className="logo-text">NextGen Wealth Studio</span>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* NAV LINKS */}
        <div className={`nav-links ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* USER */}
        <div className="nav-user">
          <div className="user-badge">
            <User size={18} />
            <span>Timothy</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
