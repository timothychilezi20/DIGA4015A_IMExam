import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Pencil,
  Check,
  X,
  LogOut,
  User,
  Mail,
  MapPin,
  Briefcase,
  Target,
  DollarSign,
  CalendarDays,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import "./Profile.css";

// ── Label maps ────────────────────────────────────────────────────────────────
const EMPLOYMENT_LABELS = {
  "first-job": "Just Started My First Job (0–1 years)",
  "early-career": "Early Career (1–3 years)",
  "mid-career": "Mid Career (3–5 years)",
  "self-employed": "Self-Employed / Freelance",
  "still-studying": "Still Studying",
  "student-job": "Studying + Working Part-Time",
  "gap-year": "Taking a Gap / Between Jobs",
};

const PROVINCE_LABELS = {
  gauteng: "Gauteng",
  "western-cape": "Western Cape",
  "kwazulu-natal": "KwaZulu-Natal",
  "eastern-cape": "Eastern Cape",
  limpopo: "Limpopo",
  mpumalanga: "Mpumalanga",
  "north-west": "North West",
  "free-state": "Free State",
  "northern-cape": "Northern Cape",
};

const GOAL_LABELS = {
  "stop-living-paycheque": "Stop Living Paycheque to Paycheque",
  "buy-property": "Buy My First Property",
  "start-investing": "Start Investing for the First Time",
  "emergency-fund": "Build a Solid Emergency Fund",
  "grow-globally": "Grow My Wealth Globally",
  "retire-early": "Retire Early or Reach Financial Freedom",
  "debt-free": "Pay Off Debt and Start Fresh",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return (
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

function saveUser(updated) {
  localStorage.setItem("absa_current_user", JSON.stringify(updated));
  const users = JSON.parse(localStorage.getItem("absa_users") || "{}");
  users[updated.email] = updated;
  localStorage.setItem("absa_users", JSON.stringify(users));
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ user, photoUrl, size = 96 }) {
  const style = { width: size, height: size, fontSize: size * 0.35 };
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt="Profile"
        className="pf-avatar pf-avatar--photo"
        style={style}
      />
    );
  }
  return (
    <span className="pf-avatar pf-avatar--initials" style={style}>
      {getInitials(user?.username)}
    </span>
  );
}

// ── Inline editable field ─────────────────────────────────────────────────────
function EditableField({
  label,
  icon,
  value,
  displayValue,
  type = "text",
  onSave,
  children,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function handleSave() {
    if (draft !== value) onSave(draft);
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setDraft(value);
      setEditing(false);
    }
  }

  return (
    <div className="pf-field">
      <div className="pf-field-label">
        <span className="pf-field-icon">{icon}</span>
        {label}
      </div>
      <div className="pf-field-body">
        {editing ? (
          <div className="pf-edit-row">
            {children ? (
              children(draft, setDraft)
            ) : (
              <input
                className="pf-input"
                type={type}
                value={draft}
                autoFocus
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            )}
            <button
              className="pf-action-btn pf-action-btn--save"
              onClick={handleSave}
              title="Save"
            >
              <Check size={14} />
            </button>
            <button
              className="pf-action-btn pf-action-btn--cancel"
              onClick={() => {
                setDraft(value);
                setEditing(false);
              }}
              title="Cancel"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="pf-display-row">
            <span className="pf-display-value">
              {displayValue || value || (
                <span className="pf-empty">Not set</span>
              )}
            </span>
            <button
              className="pf-edit-trigger"
              onClick={() => {
                setDraft(value);
                setEditing(true);
              }}
              title="Edit"
            >
              <Pencil size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Password change section ───────────────────────────────────────────────────
function PasswordSection({ user, onSave }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSave() {
    setError("");
    if (current !== user.password) {
      setError("Current password is incorrect.");
      return;
    }
    if (next.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (next !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    onSave(next);
    setSuccess(true);
    setCurrent("");
    setNext("");
    setConfirm("");
    setTimeout(() => {
      setSuccess(false);
      setOpen(false);
    }, 1800);
  }

  return (
    <div className="pf-pw-section">
      <div className="pf-field-label">
        <span className="pf-field-icon">
          <Lock size={15} />
        </span>
        Password
      </div>
      {!open ? (
        <div className="pf-display-row">
          <span className="pf-display-value pf-pw-dots">••••••••</span>
          <button className="pf-edit-trigger" onClick={() => setOpen(true)}>
            <Pencil size={13} />
          </button>
        </div>
      ) : (
        <div className="pf-pw-form">
          {["Current password", "New password", "Confirm new password"].map(
            (lbl, i) => {
              const val = [current, next, confirm][i];
              const setter = [setCurrent, setNext, setConfirm][i];
              return (
                <div key={lbl} className="pf-pw-row">
                  <label className="pf-pw-label">{lbl}</label>
                  <div className="pf-pw-input-wrap">
                    <input
                      className="pf-input"
                      type={showPw ? "text" : "password"}
                      value={val}
                      onChange={(e) => setter(e.target.value)}
                      autoComplete="new-password"
                    />
                    {i === 0 && (
                      <button
                        className="pf-pw-toggle"
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                      >
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              );
            },
          )}
          {error && (
            <div className="pf-pw-error">
              <AlertTriangle size={13} /> {error}
            </div>
          )}
          {success && (
            <div className="pf-pw-success">
              <Check size={13} /> Password updated.
            </div>
          )}
          <div className="pf-pw-actions">
            <button className="pf-save-btn" onClick={handleSave}>
              Update password
            </button>
            <button
              className="pf-cancel-btn"
              onClick={() => {
                setOpen(false);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("absa_current_user") || "null"),
  );

  const photoKey = `absa_photo_${user?.email}`;
  const [photoUrl, setPhotoUrl] = useState(
    () => localStorage.getItem(photoKey) || "",
  );

  const [saved, setSaved] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  function updateField(field, value) {
    const updated = { ...user, [field]: value };
    setUser(updated);
    saveUser(updated);
    flashSaved();
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPhotoUrl(dataUrl);
      localStorage.setItem(photoKey, dataUrl);
      flashSaved();
    };
    reader.readAsDataURL(file);
  }

  function handleLogout() {
    localStorage.removeItem("absa_current_user");
    navigate("/login");
  }

  return (
    <div className="pf-page">
      {/* ── Header banner ── */}
      <div className="pf-banner">
        <div className="pf-banner-orb pf-banner-orb--1" />
        <div className="pf-banner-orb pf-banner-orb--2" />

        <div className="pf-banner-inner">
          {/* Avatar + upload */}
          <div className="pf-avatar-wrap">
            <Avatar user={user} photoUrl={photoUrl} size={96} />
            <button
              className="pf-camera-btn"
              title="Change photo"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={15} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
          </div>

          <div className="pf-banner-text">
            <h1 className="pf-banner-name">{user.username}</h1>
            <p className="pf-banner-email">{user.email}</p>
            <div className="pf-banner-badges">
              <span className="pf-badge pf-badge--province">
                <MapPin size={11} />
                {PROVINCE_LABELS[user.province] || user.province || "—"}
              </span>
              <span className="pf-badge pf-badge--goal">
                <Target size={11} />
                {GOAL_LABELS[user.financialGoal]
                  ?.split(" ")
                  .slice(0, 4)
                  .join(" ") || "—"}
              </span>
            </div>
          </div>

          {saved && (
            <div className="pf-saved-toast">
              <Check size={13} /> Saved
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="pf-body">
        {/* Personal info */}
        <div className="pf-section">
          <div className="pf-section-header">
            <User size={16} />
            <h2>Personal information</h2>
          </div>

          <div className="pf-fields">
            <EditableField
              label="Username"
              icon={<User size={14} />}
              value={user.username}
              onSave={(v) => updateField("username", v)}
            />

            <EditableField
              label="Email address"
              icon={<Mail size={14} />}
              value={user.email}
              type="email"
              onSave={(v) => updateField("email", v)}
            />

            <EditableField
              label="Age"
              icon={<CalendarDays size={14} />}
              value={user.age}
              type="number"
              displayValue={`${user.age} years old`}
              onSave={(v) => updateField("age", Number(v))}
            />
          </div>
        </div>

        {/* Financial profile */}
        <div className="pf-section">
          <div className="pf-section-header">
            <DollarSign size={16} />
            <h2>Financial profile</h2>
          </div>

          <div className="pf-fields">
            <EditableField
              label="Monthly take-home income (ZAR)"
              icon={<DollarSign size={14} />}
              value={user.monthlyIncome}
              type="number"
              displayValue={`R ${Number(user.monthlyIncome).toLocaleString("en-ZA")}`}
              onSave={(v) => updateField("monthlyIncome", Number(v))}
            />

            <EditableField
              label="Career stage"
              icon={<Briefcase size={14} />}
              value={user.employmentStatus}
              displayValue={
                EMPLOYMENT_LABELS[user.employmentStatus] ||
                user.employmentStatus
              }
              onSave={(v) => updateField("employmentStatus", v)}
            >
              {(draft, setDraft) => (
                <select
                  className="pf-input pf-select"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                >
                  <option value="" disabled>
                    Select your situation
                  </option>
                  {Object.entries(EMPLOYMENT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
            </EditableField>

            <EditableField
              label="Province"
              icon={<MapPin size={14} />}
              value={user.province}
              displayValue={PROVINCE_LABELS[user.province] || user.province}
              onSave={(v) => updateField("province", v)}
            >
              {(draft, setDraft) => (
                <select
                  className="pf-input pf-select"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                >
                  <option value="" disabled>
                    Select province
                  </option>
                  {Object.entries(PROVINCE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
            </EditableField>

            <EditableField
              label="Primary financial goal"
              icon={<Target size={14} />}
              value={user.financialGoal}
              displayValue={
                GOAL_LABELS[user.financialGoal] || user.financialGoal
              }
              onSave={(v) => updateField("financialGoal", v)}
            >
              {(draft, setDraft) => (
                <select
                  className="pf-input pf-select"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                >
                  <option value="" disabled>
                    Select your goal
                  </option>
                  {Object.entries(GOAL_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
            </EditableField>
          </div>
        </div>

        {/* Security */}
        <div className="pf-section">
          <div className="pf-section-header">
            <ShieldCheck size={16} />
            <h2>Security</h2>
          </div>

          <div className="pf-fields">
            <PasswordSection
              user={user}
              onSave={(newPw) => updateField("password", newPw)}
            />
          </div>
        </div>

        {/* Danger zone */}
        <div className="pf-section pf-section--danger">
          <button className="pf-logout-btn" onClick={handleLogout}>
            <LogOut size={15} />
            Sign out of this account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
