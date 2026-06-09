import { useState, useMemo } from "react";
import { useUser } from "../contexts/UserContext";
import { formatCurrency } from "../utils/formatters";
import "./MoneySnapshot.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

import {
  Info,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Wallet,
  Scale,
  Home,
  Car,
  ShoppingCart,
  Tv,
  Zap,
  Shield,
  CreditCard,
  PiggyBank,
  Flame,
  GraduationCap,
  Calendar,
  Pencil,
  Check,
  X,
  Receipt,
  Heart,
  Building,
} from "lucide-react";

// ─── constants (non-editable) ─────────────────────────────────────────────────

const DEDUCTIONS = [
  { label: "SARS income tax", icon: <Receipt size={14} />, amount: 7600 },
  { label: "Medical aid", icon: <Heart size={14} />, amount: 1850 },
  { label: "UIF contribution", icon: <Building size={14} />, amount: 385 },
  { label: "RA / pension fund", icon: <PiggyBank size={14} />, amount: 415 },
];

const DEDUCTION_TOTAL = DEDUCTIONS.reduce((s, d) => s + d.amount, 0);

const DEFAULT_GROSS = 38500;

const DEFAULT_EXPENSES = {
  rent: { label: "Rent / bond", icon: <Home size={14} />, amount: 12000 },
  transport: { label: "Transport", icon: <Car size={14} />, amount: 8750 },
  food: {
    label: "Food & groceries",
    icon: <ShoppingCart size={14} />,
    amount: 4500,
  },
  entertainment: {
    label: "Entertainment",
    icon: <Tv size={14} />,
    amount: 3000,
  },
  utilities: { label: "Utilities", icon: <Zap size={14} />, amount: 2000 },
  insurance: { label: "Insurance", icon: <Shield size={14} />, amount: 1500 },
  debt: {
    label: "Debt repayments",
    icon: <CreditCard size={14} />,
    amount: 3500,
  },
  savings: {
    label: "Savings & investments",
    icon: <TrendingUp size={14} />,
    amount: 5000,
  },
};

const DEFAULT_GOALS = [
  {
    label: "Emergency fund",
    current: 48300,
    target: 120750,
    color: "#639922",
    eta: "Aug 2027",
  },
  {
    label: "Property deposit",
    current: 22000,
    target: 200000,
    color: "#378ADD",
    eta: "Mar 2030",
  },
  {
    label: "Investment portfolio",
    current: 65000,
    target: 150000,
    color: "#BA7517",
    eta: "Dec 2027",
  },
];

const DEFAULT_DEBTS = [
  { label: "Vehicle finance", icon: <Car size={14} />, amount: 95000 },
  { label: "Credit card", icon: <CreditCard size={14} />, amount: 18500 },
  { label: "Student loan", icon: <GraduationCap size={14} />, amount: 35000 },
];

const PIE_COLORS = [
  "#185FA5",
  "#BA7517",
  "#639922",
  "#D4537E",
  "#3B6D11",
  "#A32D2D",
  "#7F77DD",
  "#0F6E56",
];

const BEHAVIOURS = [
  {
    label: "Entertainment up",
    sub: "+18% vs last month",
    icon: <Flame size={14} />,
    iconBg: "#FAEEDA",
    iconColor: "#854F0B",
    badge: "Watch",
    badgeVariant: "amber",
  },
  {
    label: "Groceries on track",
    sub: "−4% vs last month",
    icon: <ShoppingCart size={14} />,
    iconBg: "#EAF3DE",
    iconColor: "#3B6D11",
    badge: "Good",
    badgeVariant: "green",
  },
  {
    label: "Savings consistent",
    sub: "4 months in a row",
    icon: <TrendingUp size={14} />,
    iconBg: "#E6F1FB",
    iconColor: "#185FA5",
    badge: "Streak",
    badgeVariant: "blue",
  },
];

// Trend data uses a function so we can pass the current net income
const buildMonthlyTrend = (netIncome) => [
  { name: "Jan", Spending: 36200, Income: netIncome },
  { name: "Feb", Spending: 38100, Income: netIncome },
  { name: "Mar", Spending: 37500, Income: netIncome },
  { name: "Apr", Spending: 39800, Income: netIncome },
  { name: "May", Spending: 40250, Income: netIncome },
  { name: "Jun", Spending: 40250, Income: netIncome },
];

const buildWeeklyTrend = (netIncome) => {
  const weekly = Math.round(netIncome / 4);
  return [
    { name: "Wk 1", Spending: 9800, Income: weekly },
    { name: "Wk 2", Spending: 10200, Income: weekly },
    { name: "Wk 3", Spending: 9600, Income: weekly },
    { name: "Wk 4", Spending: 10500, Income: weekly },
    { name: "Wk 5", Spending: 9900, Income: weekly },
    { name: "Wk 6", Spending: 10050, Income: weekly },
    { name: "Wk 7", Spending: 10100, Income: weekly },
    { name: "Wk 8", Spending: 10200, Income: weekly },
  ];
};

// ─── small helpers ────────────────────────────────────────────────────────────

function Badge({ children, variant = "green" }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

function Tooltip({ content }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Info size={13} className="tooltip-icon" />
      {show && <span className="tooltip-box">{content}</span>}
    </span>
  );
}

function SectionLabel({ children }) {
  return <p className="section-label">{children}</p>;
}

function Card({ children, className = "" }) {
  return <div className={`ms-card ${className}`}>{children}</div>;
}

function MetricCard({ label, value, sub, subColor }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sub && (
        <div className="metric-sub" style={subColor ? { color: subColor } : {}}>
          {sub}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ pct, color }) {
  return (
    <div className="progress-bg">
      <div
        className="progress-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ─── inline edit field ────────────────────────────────────────────────────────
// Reusable component: shows a formatted value + pencil; swaps to an input on edit.

function EditableAmount({ value, onSave, formatFn = formatCurrency }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function handleSave() {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed >= 0) onSave(parsed);
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setEditing(false);
  }

  if (editing) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <input
          className="income-edit-input"
          type="number"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="income-edit-btn income-edit-btn--save"
          onClick={handleSave}
        >
          <Check size={12} />
        </button>
        <button
          className="income-edit-btn income-edit-btn--cancel"
          onClick={() => setEditing(false)}
        >
          <X size={12} />
        </button>
      </span>
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span>{formatFn(value)}</span>
      <button
        className="income-edit-trigger"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        title="Edit"
      >
        <Pencil size={12} />
      </button>
    </span>
  );
}

const currencyFormatter = (v) => `R ${(v / 1000).toFixed(0)}k`;
const tooltipFormatter = (v) => formatCurrency(v);

// ─── sub-sections ─────────────────────────────────────────────────────────────

function IncomeExpenses({
  grossSalary,
  expenses,
  netIncome,
  onUpdateExpense,
  onUpdateGross,
}) {
  const totalExpenses = Object.values(expenses).reduce(
    (s, e) => s + e.amount,
    0,
  );

  return (
    <Card>
      {/* Gross / Net summary row */}
      <div className="income-row">
        <div className="income-half income-half--editable">
          <div className="income-lbl">Gross salary</div>
          <EditableAmount value={grossSalary} onSave={onUpdateGross} />
        </div>
        <div className="income-half income-half--green">
          <div className="income-lbl">Net take-home</div>
          <div className="income-val" style={{ color: "#3B6D11" }}>
            {formatCurrency(netIncome)}
          </div>
        </div>
      </div>

      {/* Deductions (fixed — determined by SARS / employer) */}
      <p className="subsection-title">Deductions breakdown</p>
      {DEDUCTIONS.map((d) => (
        <div className="detail-row" key={d.label}>
          <span className="detail-row__label">
            <span className="detail-row__icon">{d.icon}</span>
            {d.label}
          </span>
          <span className="detail-row__val">{formatCurrency(d.amount)}</span>
        </div>
      ))}

      <hr className="ms-divider" />

      {/* Expenses (all editable) */}
      <p className="subsection-title">Monthly expenses</p>
      {Object.entries(expenses).map(([key, exp]) => {
        const isTransport = key === "transport";
        const isSavings = key === "savings";
        const pct = Math.round((exp.amount / netIncome) * 100);

        return (
          <div
            key={key}
            className={`detail-row${isTransport ? " detail-row--warn" : isSavings ? " detail-row--green" : ""}`}
          >
            <span className="detail-row__label">
              <span className="detail-row__icon">{exp.icon}</span>
              {exp.label}
              {isTransport && <Badge variant="amber">{pct}% of net</Badge>}
              {isSavings && <Badge variant="green">✓</Badge>}
            </span>
            <EditableAmount
              value={exp.amount}
              onSave={(newAmt) => onUpdateExpense(key, newAmt)}
              formatFn={(v) => (
                <span
                  className={
                    isSavings ? "detail-row__val--green" : "detail-row__val"
                  }
                >
                  {formatCurrency(v)}
                </span>
              )}
            />
          </div>
        );
      })}

      <hr className="ms-divider" />
      <div className="detail-row detail-row--total">
        <span>Total expenses</span>
        <span>{formatCurrency(totalExpenses)}</span>
      </div>
    </Card>
  );
}

function SpendingPie({ expenses }) {
  const data = Object.values(expenses).map((e) => ({
    name: e.label,
    value: e.amount,
  }));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <div className="card-header">
        <span className="card-title">Spending Breakdown</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <ReTooltip
            formatter={(value, name) => [
              `${formatCurrency(value)} (${Math.round((value / total) * 100)}%)`,
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pie-legend">
        {data.map((d, i) => (
          <span key={d.name} className="pie-legend__item">
            <span
              className="pie-legend__dot"
              style={{ background: PIE_COLORS[i] }}
            />
            {d.name} {Math.round((d.value / total) * 100)}%
          </span>
        ))}
      </div>
    </Card>
  );
}

function Insights({ transportPct, totalExpenses }) {
  return (
    <Card className="insights-card">
      <div className="card-header">
        <span className="card-title">Recommendations</span>
        <Badge variant="blue">AI powered</Badge>
      </div>

      <div className="insight-item insight-item--warn">
        <div className="insight-icon insight-icon--warn">
          <AlertTriangle size={15} />
        </div>
        <div>
          <div className="insight-title">High transport spend</div>
          <div className="insight-body">
            At {Math.round(transportPct)}% of net income, transport is your
            largest variable cost. Review fuel usage or explore a monthly public
            transit pass.
          </div>
        </div>
      </div>

      <div className="insight-item insight-item--ok">
        <div className="insight-icon insight-icon--ok">
          <Lightbulb size={15} />
        </div>
        <div>
          <div className="insight-title">RA contribution room</div>
          <div className="insight-body">
            You can deduct up to 27.5% of taxable income. Increasing your RA by
            R 1,500/month could save ~R 630 in tax.
          </div>
        </div>
      </div>

      <div className="insight-item insight-item--info">
        <div className="insight-icon insight-icon--info">
          <BarChart3 size={15} />
        </div>
        <div>
          <div className="insight-title">Emergency fund target</div>
          <div className="insight-body">
            3-month buffer = {formatCurrency(Math.round(totalExpenses * 3))}. At
            R 2,000/month you'll be fully funded in ~18 months.
          </div>
        </div>
      </div>
    </Card>
  );
}

function FinancialGoals({ goals, onUpdateGoal }) {
  return (
    <Card>
      <div className="card-header">
        <span className="card-title">Financial goals</span>
      </div>
      {goals.map((g, i) => {
        const pct = Math.round((g.current / g.target) * 100);
        return (
          <div className="goal-row" key={g.label}>
            <div className="goal-header">
              <span className="goal-label">{g.label}</span>
              <span
                className="goal-amounts"
                style={{
                  color: g.color,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <EditableAmount
                  value={g.current}
                  onSave={(v) => onUpdateGoal(i, "current", v)}
                />
                {" / "}
                <EditableAmount
                  value={g.target}
                  onSave={(v) => onUpdateGoal(i, "target", v)}
                />
              </span>
            </div>
            <ProgressBar pct={Math.min(pct, 100)} color={g.color} />
            <div className="goal-meta">
              <span>{pct}% complete</span>
              <span className="goal-eta">
                <Calendar size={11} /> {g.eta}
              </span>
            </div>
          </div>
        );
      })}
    </Card>
  );
}

function DebtSummary({ debts, onUpdateDebt }) {
  const total = debts.reduce((s, d) => s + d.amount, 0);

  return (
    <Card>
      <div className="card-header">
        <span className="card-title">Debt summary</span>
      </div>
      <div className="debt-total">
        <div>
          <div className="debt-total__lbl">Total outstanding</div>
          <div className="debt-total__val">{formatCurrency(total)}</div>
        </div>
        <Badge variant="amber">{debts.length} accounts</Badge>
      </div>
      {debts.map((d, i) => (
        <div className="detail-row" key={d.label}>
          <span className="detail-row__label">
            <span className="detail-row__icon">{d.icon}</span>
            {d.label}
          </span>
          <EditableAmount value={d.amount} onSave={(v) => onUpdateDebt(i, v)} />
        </div>
      ))}
      <hr className="ms-divider" />
      <p className="debt-footer">
        At current payments, debt-free by <strong>Sep 2029</strong>
      </p>
    </Card>
  );
}

function SpendingPatterns() {
  return (
    <Card>
      <div className="card-header">
        <span className="card-title">Spending patterns</span>
      </div>
      {BEHAVIOURS.map((b) => (
        <div className="beh-row" key={b.label}>
          <div className="beh-left">
            <div
              className="beh-icon"
              style={{ background: b.iconBg, color: b.iconColor }}
            >
              {b.icon}
            </div>
            <div>
              <div className="beh-title">{b.label}</div>
              <div className="beh-sub">{b.sub}</div>
            </div>
          </div>
          <Badge variant={b.badgeVariant}>{b.badge}</Badge>
        </div>
      ))}
    </Card>
  );
}

function SpendingTrend({ netIncome }) {
  const [tab, setTab] = useState("monthly");

  const data =
    tab === "monthly"
      ? buildMonthlyTrend(netIncome)
      : buildWeeklyTrend(netIncome);

  return (
    <Card className="trend-card">
      <div className="card-header">
        <span className="card-title">Spending over time</span>
        <div className="tab-group">
          {["monthly", "weekly"].map((t) => (
            <button
              key={t}
              className={`tab-btn${tab === t ? " tab-btn--active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={currencyFormatter}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <ReTooltip formatter={tooltipFormatter} />
          <Line
            type="monotone"
            dataKey="Spending"
            stroke="#378ADD"
            strokeWidth={2}
            dot={{ r: 4, fill: "#378ADD" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Income"
            stroke="#639922"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="trend-legend">
        <span className="trend-legend__item">
          <span className="trend-legend__line trend-legend__line--solid" />
          Spending
        </span>
        <span className="trend-legend__item">
          <span className="trend-legend__line trend-legend__line--dashed" />
          Net income
        </span>
      </div>
    </Card>
  );
}

function FinancialConcepts() {
  const concepts = [
    {
      icon: <Wallet size={22} />,
      title: "Net income",
      body: "Your take-home pay after all deductions (tax, medical aid, retirement contributions). This is what you have available to save and invest.",
    },
    {
      icon: <TrendingUp size={22} />,
      title: "Savings rate",
      body: "The percentage of income saved each month. Financial experts recommend at least 15–20% for long-term wealth building.",
    },
    {
      icon: <Scale size={22} />,
      title: "Debt-to-income ratio",
      body: "Total monthly debt payments divided by gross income. Lenders prefer a DTI below 36% for home loan approvals.",
    },
  ];

  return (
    <Card className="concepts-card">
      <div className="card-header">
        <span className="card-title">Financial concepts explained</span>
      </div>
      <div className="concepts-grid">
        {concepts.map((c) => (
          <div className="concept-item" key={c.title}>
            <div className="concept-icon">{c.icon}</div>
            <div>
              <div className="concept-title">{c.title}</div>
              <div className="concept-body">{c.body}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

function MoneySnapshot() {
  const { userProfile } = useUser();

  // ── editable state ──────────────────────────────────────────────────────────
  const [grossSalary, setGrossSalary] = useState(DEFAULT_GROSS);

  const [expenses, setExpenses] = useState(() => {
    const base = { ...DEFAULT_EXPENSES };
    // Seed savings from userProfile if provided
    if (userProfile?.monthlySavings != null) {
      base.savings = { ...base.savings, amount: userProfile.monthlySavings };
    }
    return base;
  });

  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [debts, setDebts] = useState(DEFAULT_DEBTS);

  // ── derived values (recompute whenever grossSalary or expenses change) ──────
  const {
    netIncome,
    totalExpenses,
    remaining,
    savingsRate,
    debtToIncome,
    transportPct,
  } = useMemo(() => {
    const netIncome = grossSalary - DEDUCTION_TOTAL;
    const totalExpenses = Object.values(expenses).reduce(
      (s, e) => s + e.amount,
      0,
    );
    return {
      netIncome,
      totalExpenses,
      remaining: netIncome - totalExpenses,
      savingsRate: (expenses.savings.amount / netIncome) * 100,
      debtToIncome: (expenses.debt.amount / netIncome) * 100,
      transportPct: (expenses.transport.amount / netIncome) * 100,
    };
  }, [grossSalary, expenses]);

  // ── update handlers ─────────────────────────────────────────────────────────

  function updateExpense(key, newAmount) {
    setExpenses((prev) => ({
      ...prev,
      [key]: { ...prev[key], amount: newAmount },
    }));
  }

  function updateGoal(index, field, newValue) {
    setGoals((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: newValue } : g)),
    );
  }

  function updateDebt(index, newAmount) {
    setDebts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, amount: newAmount } : d)),
    );
  }

  // ── status labels ───────────────────────────────────────────────────────────

  const savingsStatus =
    savingsRate >= 20
      ? { text: "Excellent", color: "#3B6D11" }
      : savingsRate >= 15
        ? { text: "Good", color: "#3B6D11" }
        : savingsRate >= 10
          ? { text: "On track", color: "#854F0B" }
          : { text: "Needs work", color: "#A32D2D" };

  const dtiStatus =
    debtToIncome < 30
      ? { text: "Healthy", color: "#3B6D11" }
      : debtToIncome < 40
        ? { text: "Moderate", color: "#854F0B" }
        : { text: "High", color: "#A32D2D" };

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
      <div className="ms-page">
        <div className="page-header">
          <h1 className="page-title">Money Snapshot</h1>
          <p className="page-description">
            Your complete financial picture · June 2026
          </p>
        </div>

        {/* ── At a glance ── */}
        <SectionLabel>At a glance</SectionLabel>
        <div className="metrics-grid">
          <MetricCard
            label="Net take-home"
            value={formatCurrency(netIncome)}
            sub="after all deductions"
          />
          <MetricCard
            label="Savings rate"
            value={`${savingsRate.toFixed(1)}%`}
            sub={savingsStatus.text}
            subColor={savingsStatus.color}
          />
          <MetricCard
            label="Debt-to-income"
            value={`${debtToIncome.toFixed(1)}%`}
            sub={dtiStatus.text}
            subColor={dtiStatus.color}
          />
          <MetricCard
            label="Remaining this month"
            value={formatCurrency(remaining)}
            sub="after all expenses"
          />
        </div>

        {/* ── Income & expenses ── */}
        <SectionLabel>Income &amp; expenses</SectionLabel>
        <div className="ms-grid ms-grid--2col">
          <IncomeExpenses
            grossSalary={grossSalary}
            expenses={expenses}
            netIncome={netIncome}
            onUpdateExpense={updateExpense}
            onUpdateGross={setGrossSalary}
          />
          <div
            className="right-stack"
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <SpendingPie expenses={expenses} />
            <Insights
              transportPct={transportPct}
              totalExpenses={totalExpenses}
            />
          </div>
        </div>

        {/* ── Goals, debt & patterns ── */}
        <SectionLabel>Goals, debt &amp; patterns</SectionLabel>
        <div className="ms-grid ms-grid--3col">
          <FinancialGoals goals={goals} onUpdateGoal={updateGoal} />
          <DebtSummary debts={debts} onUpdateDebt={updateDebt} />
          <SpendingPatterns />
        </div>

        {/* ── Trend ── */}
        <SectionLabel>Spending trend</SectionLabel>
        <SpendingTrend netIncome={netIncome} />

        {/* ── Learn ── */}
        <SectionLabel>Learn</SectionLabel>
        <FinancialConcepts />
      </div>
    </div>
  );
}

export default MoneySnapshot;
