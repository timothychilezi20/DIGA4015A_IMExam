import { useState, useMemo, useEffect } from "react";
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
  TrendingDown,
  Minus,
} from "lucide-react";

// ─── constants ────────────────────────────────────────────────────────────────

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

// ─── spending pattern thresholds ─────────────────────────────────────────────
// Each rule: evaluate expense pct of netIncome against thresholds.
// Returns { label, sub, icon, iconBg, iconColor, badge, badgeVariant }

function buildPatterns(expenses, netIncome) {
  const pct = (key) => ((expenses[key]?.amount ?? 0) / netIncome) * 100;
  const amt = (key) => expenses[key]?.amount ?? 0;
  const patterns = [];

  // Transport: warn above 20%, good below 15%
  const transportPct = pct("transport");
  patterns.push(
    transportPct > 20
      ? {
          label: "Transport spend high",
          sub: `${transportPct.toFixed(0)}% of net income — target is under 20%`,
          icon: <Car size={14} />,
          iconBg: "#FAEEDA",
          iconColor: "#854F0B",
          badge: "Watch",
          badgeVariant: "amber",
        }
      : transportPct < 15
        ? {
            label: "Transport under control",
            sub: `${transportPct.toFixed(0)}% of net income — well within target`,
            icon: <Car size={14} />,
            iconBg: "#EAF3DE",
            iconColor: "#3B6D11",
            badge: "Good",
            badgeVariant: "green",
          }
        : {
            label: "Transport on track",
            sub: `${transportPct.toFixed(0)}% of net income — within range`,
            icon: <Car size={14} />,
            iconBg: "#E6F1FB",
            iconColor: "#185FA5",
            badge: "OK",
            badgeVariant: "blue",
          },
  );

  // Entertainment: warn above 10%, good below 5%
  const entPct = pct("entertainment");
  patterns.push(
    entPct > 10
      ? {
          label: "Entertainment up",
          sub: `${entPct.toFixed(0)}% of net — consider trimming to 5–8%`,
          icon: <Tv size={14} />,
          iconBg: "#FAEEDA",
          iconColor: "#854F0B",
          badge: "Watch",
          badgeVariant: "amber",
        }
      : entPct < 5
        ? {
            label: "Entertainment low",
            sub: `${entPct.toFixed(0)}% of net — a healthy balance is fine`,
            icon: <Tv size={14} />,
            iconBg: "#EAF3DE",
            iconColor: "#3B6D11",
            badge: "Good",
            badgeVariant: "green",
          }
        : {
            label: "Entertainment balanced",
            sub: `${entPct.toFixed(0)}% of net — within healthy range`,
            icon: <Tv size={14} />,
            iconBg: "#E6F1FB",
            iconColor: "#185FA5",
            badge: "OK",
            badgeVariant: "blue",
          },
  );

  // Savings: good at 20%+, warn below 10%, critical below 5%
  const savingsPct = pct("savings");
  patterns.push(
    savingsPct >= 20
      ? {
          label: "Savings on target",
          sub: `${savingsPct.toFixed(0)}% of net — hitting the 20% benchmark`,
          icon: <TrendingUp size={14} />,
          iconBg: "#EAF3DE",
          iconColor: "#3B6D11",
          badge: "Streak",
          badgeVariant: "green",
        }
      : savingsPct >= 10
        ? {
            label: "Savings below target",
            sub: `${savingsPct.toFixed(0)}% of net — aim for 20%`,
            icon: <TrendingUp size={14} />,
            iconBg: "#FAEEDA",
            iconColor: "#854F0B",
            badge: "Watch",
            badgeVariant: "amber",
          }
        : {
            label: "Savings too low",
            sub: `${savingsPct.toFixed(0)}% of net — increase urgently`,
            icon: <TrendingDown size={14} />,
            iconBg: "#FDECEA",
            iconColor: "#A32D2D",
            badge: "Action",
            badgeVariant: "red",
          },
  );

  // Food: warn above 15%
  const foodPct = pct("food");
  if (foodPct > 15) {
    patterns.push({
      label: "Grocery spend elevated",
      sub: `${foodPct.toFixed(0)}% of net — meal planning can help`,
      icon: <ShoppingCart size={14} />,
      iconBg: "#FAEEDA",
      iconColor: "#854F0B",
      badge: "Watch",
      badgeVariant: "amber",
    });
  } else {
    patterns.push({
      label: "Groceries on track",
      sub: `${foodPct.toFixed(0)}% of net — within healthy range`,
      icon: <ShoppingCart size={14} />,
      iconBg: "#EAF3DE",
      iconColor: "#3B6D11",
      badge: "Good",
      badgeVariant: "green",
    });
  }

  // Debt repayments: warn above 15%
  const debtPct = pct("debt");
  patterns.push(
    debtPct > 15
      ? {
          label: "Debt load is high",
          sub: `${debtPct.toFixed(0)}% of net — reduce before investing more`,
          icon: <CreditCard size={14} />,
          iconBg: "#FDECEA",
          iconColor: "#A32D2D",
          badge: "Action",
          badgeVariant: "red",
        }
      : debtPct > 8
        ? {
            label: "Debt manageable",
            sub: `${debtPct.toFixed(0)}% of net — keep paying down`,
            icon: <CreditCard size={14} />,
            iconBg: "#FAEEDA",
            iconColor: "#854F0B",
            badge: "Watch",
            badgeVariant: "amber",
          }
        : {
            label: "Debt well controlled",
            sub: `${debtPct.toFixed(0)}% of net — well below the 15% threshold`,
            icon: <CreditCard size={14} />,
            iconBg: "#EAF3DE",
            iconColor: "#3B6D11",
            badge: "Good",
            badgeVariant: "green",
          },
  );

  return patterns.slice(0, 3); // show top 3 most relevant
}

// ─── dynamic AI recommendations ───────────────────────────────────────────────

function buildInsights(expenses, netIncome, totalExpenses) {
  const pct = (key) => ((expenses[key]?.amount ?? 0) / netIncome) * 100;
  const insights = [];

  // Transport
  const tPct = pct("transport");
  if (tPct > 20) {
    insights.push({
      variant: "warn",
      title: "High transport spend",
      body: `At ${tPct.toFixed(0)}% of net income, transport is your largest variable cost. Review fuel usage, consider carpooling, or explore a monthly Gautrain/MyCiti pass.`,
    });
  } else if (tPct < 10) {
    insights.push({
      variant: "ok",
      title: "Transport well managed",
      body: `Transport is only ${tPct.toFixed(0)}% of your net income — well within the recommended 15–20%. Keep it up.`,
    });
  }

  // Savings rate vs RA room
  const savingsPct = pct("savings");
  if (savingsPct < 15) {
    const gap = Math.round(netIncome * 0.2 - expenses.savings.amount);
    insights.push({
      variant: "warn",
      title: "Savings rate below target",
      body: `You're saving ${savingsPct.toFixed(0)}% of net income. Increasing by ${formatCurrency(gap)}/month reaches the recommended 20% and significantly boosts long-term wealth.`,
    });
  } else {
    // Show RA contribution room instead
    insights.push({
      variant: "ok",
      title: "RA contribution room",
      body: `You can deduct up to 27.5% of taxable income. Increasing your RA by R 1,500/month could save ~R 630 in tax and boost your retirement balance.`,
    });
  }

  // Emergency fund
  const emergencyTarget = Math.round(totalExpenses * 3);
  const emergencyMonthly = 2000;
  const monthsToFund = Math.ceil(emergencyTarget / emergencyMonthly);
  insights.push({
    variant: "info",
    title: "Emergency fund target",
    body: `A 3-month buffer is ${formatCurrency(emergencyTarget)}. At ${formatCurrency(emergencyMonthly)}/month you'll be fully funded in ~${monthsToFund} months.`,
  });

  // Debt warning if high
  const debtPct = pct("debt");
  if (debtPct > 15) {
    insights.push({
      variant: "warn",
      title: "Debt repayments are high",
      body: `At ${debtPct.toFixed(0)}% of net income, debt is limiting your ability to invest. Prioritise paying off high-interest debt before adding investment contributions.`,
    });
  }

  // Entertainment
  const entPct = pct("entertainment");
  if (entPct > 10) {
    insights.push({
      variant: "info",
      title: "Entertainment spend creeping up",
      body: `Entertainment is ${entPct.toFixed(0)}% of net income. A budget of 5–8% frees up ${formatCurrency(Math.round(((entPct - 7) / 100) * netIncome))}/month for savings.`,
    });
  }

  return insights.slice(0, 3); // top 3
}

// ─── small helpers ────────────────────────────────────────────────────────────

function Badge({ children, variant = "green" }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
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
          {" "}
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

      <p className="subsection-title">Monthly expenses</p>
      {Object.entries(expenses).map(([key, exp]) => {
        const isTransport = key === "transport";
        const isSavings = key === "savings";
        const p = Math.round((exp.amount / netIncome) * 100);

        return (
          <div
            key={key}
            className={`detail-row${isTransport ? " detail-row--warn" : isSavings ? " detail-row--green" : ""}`}
          >
            <span className="detail-row__label">
              <span className="detail-row__icon">{exp.icon}</span>
              {exp.label}
              {isTransport && <Badge variant="amber">{p}% of net</Badge>}
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

// ── Now fully dynamic — re-evaluates on every expense change ─────────────────
function Insights({ expenses, netIncome, totalExpenses }) {
  const insights = buildInsights(expenses, netIncome, totalExpenses);

  const variantCfg = {
    warn: {
      cls: "insight-item--warn",
      iconCls: "insight-icon--warn",
      Icon: AlertTriangle,
    },
    ok: {
      cls: "insight-item--ok",
      iconCls: "insight-icon--ok",
      Icon: Lightbulb,
    },
    info: {
      cls: "insight-item--info",
      iconCls: "insight-icon--info",
      Icon: BarChart3,
    },
  };

  return (
    <Card className="insights-card">
      <div className="card-header">
        <span className="card-title">Recommendations</span>
        <Badge variant="blue">AI powered</Badge>
      </div>
      {insights.map((ins, i) => {
        const cfg = variantCfg[ins.variant];
        return (
          <div key={i} className={`insight-item ${cfg.cls}`}>
            <div className={`insight-icon ${cfg.iconCls}`}>
              <cfg.Icon size={15} />
            </div>
            <div>
              <div className="insight-title">{ins.title}</div>
              <div className="insight-body">{ins.body}</div>
            </div>
          </div>
        );
      })}
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
        const p = Math.round((g.current / g.target) * 100);
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
            <ProgressBar pct={Math.min(p, 100)} color={g.color} />
            <div className="goal-meta">
              <span>{p}% complete</span>
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

// ── Now fully dynamic — re-evaluates on every expense change ─────────────────
function SpendingPatterns({ expenses, netIncome }) {
  const patterns = buildPatterns(expenses, netIncome);

  return (
    <Card>
      <div className="card-header">
        <span className="card-title">Spending patterns</span>
      </div>
      {patterns.map((b) => (
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
  const buildMonthlyTrend = (n) => [
    { name: "Jan", Spending: 36200, Income: n },
    { name: "Feb", Spending: 38100, Income: n },
    { name: "Mar", Spending: 37500, Income: n },
    { name: "Apr", Spending: 39800, Income: n },
    { name: "May", Spending: 40250, Income: n },
    { name: "Jun", Spending: 40250, Income: n },
  ];
  const buildWeeklyTrend = (n) => {
    const w = Math.round(n / 4);
    return [
      { name: "Wk 1", Spending: 9800, Income: w },
      { name: "Wk 2", Spending: 10200, Income: w },
      { name: "Wk 3", Spending: 9600, Income: w },
      { name: "Wk 4", Spending: 10500, Income: w },
      { name: "Wk 5", Spending: 9900, Income: w },
      { name: "Wk 6", Spending: 10050, Income: w },
      { name: "Wk 7", Spending: 10100, Income: w },
      { name: "Wk 8", Spending: 10200, Income: w },
    ];
  };
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
  const { userProfile, updateProfile } = useUser();

  const [grossSalary, setGrossSalary] = useState(DEFAULT_GROSS);
  const [expenses, setExpenses] = useState(() => {
    const base = { ...DEFAULT_EXPENSES };
    if (userProfile?.monthlySavings != null) {
      base.savings = { ...base.savings, amount: userProfile.monthlySavings };
    }
    return base;
  });
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [debts, setDebts] = useState(DEFAULT_DEBTS);

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

  // Sync edits back to UserContext → keeps Home.jsx charts live
  useEffect(() => {
    updateProfile({
      monthlyIncome: netIncome,
      monthlyExpenses: totalExpenses - expenses.savings.amount,
      monthlySavings: expenses.savings.amount,
    });
  }, [netIncome, totalExpenses, expenses.savings.amount]);

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

  return (
    <div className="page-container">
      <div className="ms-page">
        <div className="page-header">
          <h1 className="page-title">Money Snapshot</h1>
          <p className="page-description">
            Your complete financial picture · June 2026
          </p>
        </div>

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
            {/* Pass live expenses + netIncome so recommendations update on every edit */}
            <Insights
              expenses={expenses}
              netIncome={netIncome}
              totalExpenses={totalExpenses}
            />
          </div>
        </div>

        <SectionLabel>Goals, debt &amp; patterns</SectionLabel>
        <div className="ms-grid ms-grid--3col">
          <FinancialGoals goals={goals} onUpdateGoal={updateGoal} />
          <DebtSummary debts={debts} onUpdateDebt={updateDebt} />
          {/* Pass live expenses + netIncome so patterns update on every edit */}
          <SpendingPatterns expenses={expenses} netIncome={netIncome} />
        </div>

        <SectionLabel>Spending trend</SectionLabel>
        <SpendingTrend netIncome={netIncome} />

        <SectionLabel>Learn</SectionLabel>
        <FinancialConcepts />
      </div>
    </div>
  );
}

export default MoneySnapshot;
