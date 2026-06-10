import { NavLink, useNavigate, Link } from "react-router-dom";
import { useState, useRef } from "react";
import logo from "../../assets/ABSA_Group_Limited_Logo.svg.png";
import {
  Home,
  Wallet,
  Target,
  FlaskConical,
  Menu,
  X,
  LogOut,
  Camera,
  User,
} from "lucide-react";

import "./Navigation.css";

// ── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatLabel(key) {
  const MAP = {
    employmentStatus: "Career stage",
    monthlyIncome: "Monthly income",
    province: "Province",
    financialGoal: "Financial goal",
    age: "Age",
  };
  return MAP[key] || key;
}

function formatValue(key, value) {
  if (key === "monthlyIncome")
    return `R ${Number(value).toLocaleString("en-ZA")}`;
  if (key === "age") return `${value} yrs`;
  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const PROFILE_FIELDS = [
  "age",
  "monthlyIncome",
  "employmentStatus",
  "province",
  "financialGoal",
];

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, photoUrl, size = 50 }) {
  const initials = getInitials(user?.username || "");
  const style = { width: size, height: size, fontSize: size * 0.38 };

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt="Profile"
        className="avatar avatar--photo"
        style={style}
      />
    );
  }
  return (
    <span className="avatar avatar--initials" style={style}>
      {initials || "?"}
    </span>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("absa_current_user"));
  const username = currentUser?.username || "Guest";

  const photoKey = `absa_photo_${currentUser?.email}`;
  const [photoUrl, setPhotoUrl] = useState(
    () => localStorage.getItem(photoKey) || "",
  );

  const handleLogout = () => {
    localStorage.removeItem("absa_current_user");
    navigate("/login");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPhotoUrl(dataUrl);
      localStorage.setItem(photoKey, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const closeMenu = () => setShowUserMenu(false);

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
          <button
            className="user-avatar-btn"
            onClick={() => setShowUserMenu((v) => !v)}
            aria-label="Open user menu"
          >
            <Avatar user={currentUser} photoUrl={photoUrl} size={50} />
          </button>

          {showUserMenu && (
            <>
              <div className="user-dropdown-backdrop" onClick={closeMenu} />

              <div className="user-dropdown">
                {/* Header */}
                <div className="user-dropdown-header">
                  <div className="user-dropdown-avatar-wrap">
                    <Avatar user={currentUser} photoUrl={photoUrl} size={56} />
                    <button
                      className="avatar-upload-btn"
                      title="Change photo"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera size={12} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handlePhotoChange}
                    />
                  </div>
                  <div className="user-dropdown-identity">
                    <p className="user-dropdown-name">{username}</p>
                    <p className="user-dropdown-email">{currentUser?.email}</p>
                  </div>
                </div>

                {/* Profile details */}
                {currentUser && (
                  <div className="user-dropdown-details">
                    {PROFILE_FIELDS.filter((f) => currentUser[f]).map(
                      (field) => (
                        <div key={field} className="user-dropdown-row">
                          <span className="user-dropdown-row-label">
                            {formatLabel(field)}
                          </span>
                          <span className="user-dropdown-row-value">
                            {formatValue(field, currentUser[field])}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {/* View Profile link */}
                <Link
                  to="/profile"
                  className="user-dropdown-profile-link"
                  onClick={closeMenu}
                >
                  <User size={15} />
                  View & edit profile
                </Link>

                {/* Sign out */}
                <button className="user-dropdown-logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
