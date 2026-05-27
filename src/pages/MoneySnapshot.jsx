import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { formatCurrency } from "../utils/formatters";
import "./MoneySnapshot.css";
import "../styles/main.css";

import {
  Info,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  PiggyBank,
  CreditCard,
  Wallet,
  Scale,
} from "lucide-react";

function MoneySnapshot() {
  const { userProfile, updateProfile } = useUser();
  const [expenses, setExpenses] = useState({
    rent: 12000,
    transport: 8750,
    food: 4500,
    entertainment: 3000,
    savings: userProfile.monthlySavings,
    debt: 3500,
    insurance: 1500,
    utilities: 2000,
  });

  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const netIncome = userProfile.monthlyIncome - totalExpenses;
  const savingsRate = (expenses.savings / userProfile.monthlyIncome) * 100;
  const debtToIncome = (expenses.debt / userProfile.monthlyIncome) * 100;
  const transportPercent =
    (expenses.transport / userProfile.monthlyIncome) * 100;

  const [animatedNetIncome, setAnimatedNetIncome] = useState(0);
  const [animatedSavings, setAnimatedSavings] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setAnimatedNetIncome(netIncome * progress);
      setAnimatedSavings(expenses.savings * progress);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [netIncome, expenses.savings]);

  const handleExpenseChange = (category, value) => {
    setExpenses((prev) => ({ ...prev, [category]: value }));
  };

  const handleIncomeChange = (e) => {
    updateProfile({ monthlyIncome: Number(e.target.value) });
  };

  const getSavingsStatus = () => {
    if (savingsRate >= 20) return { text: "Excellent", class: "Success" };
    if (savingsRate >= 15) return { text: "Good", class: "Success" };
    if (savingsRate >= 10) return { text: "On Track", class: "Warning" };
    return { text: "Needs Improvement", class: "Error" };
  };

  const savingsStatus = getSavingsStatus();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Money Snapshot</h1>
        <p className="page-description">
          Understand your current financial situation at a glance
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Net Income</span>
            <Tooltip content="Your income after all expense and deductions" />
          </div>
          <div className="stat-value number">
            {formatCurrency(Math.round(animatedNetIncome))}
          </div>
          <div className="stat-trend positive">
            <TrendingUp size={16} className="trend-icon" />
            <span className="trend-text">+12% from last month</span>
          </div>
        </div>

        <div class="stat-card">
          <div className="stat-header">
            <span className="stat-label">Savings Rate</span>
            <Tooltip content="Percentage of your income that you save each month" />
          </div>
          <div className="stat-value number">{savingsStatus.text}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Monthly Savings</span>
            <Tooltip content="Amount you're putting aside each month" />
          </div>
          <div class="stat-value number">
            {formatCurrency(Math.round(animatedSavings))}
          </div>
          <div className="stat-target">
            Target: {formatCurrency(userProfile.monthlyIncome * 0.2)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Debt-to-Income</span>
            <Tooltip content="Percentage of income going to debt payments" />
          </div>
          <div className="stat-value number">{debtToIncome.toFixed(1)}%</div>
          <div
            className={`stat-status ${debtToIncome < 30 ? "success" : debtToIncome < 40 ? "warning" : "error"}`}
          >
            {debtToIncome < 30
              ? "Healthy"
              : debtToIncome < 40
                ? "Moderate"
                : "High"}
          </div>
        </div>
      </div>

      <div className="two-column-layout">
        {/* Left Column - Income & Expenses */}
        <div className="left-column">
          <div className="card">
            <div className="card-header">
              <h3>Income & Expenses</h3>
              <button className="edit-btn">Edit</button>
            </div>

            <div className="income-section">
              <div className="input-group">
                <label className="label">Monthly Salary (ZAR)</label>
                <div className="input-wrapper">
                  <span className="input-currency">R</span>
                  <input
                    type="number"
                    value={userProfile.monthlyIncome}
                    onChange={handleIncomeChange}
                    className="currency-input number"
                  />
                </div>
              </div>
            </div>

            <div className="expenses-section">
              <h4 className="section-subtitle">Expenses</h4>

              <div className="expense-item">
                <div className="expense-info">
                  <span className="expense-name">Rent/Mortgage</span>
                  <Tooltip content="Monthly housing costs including bond or rent" />
                </div>
                <div className="expense-amount number">
                  {formatCurrency(expenses.rent)}
                </div>
              </div>

              <div className="expense-item warning-highlight">
                <div className="expense-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    fill="gray"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="gray"
                      stroke-width="2"
                      fill="none"
                    />
                    <line
                      x1="8"
                      y1="12"
                      x2="16"
                      y2="12"
                      stroke="gray"
                      stroke-width="2"
                    />
                  </svg>
                  <span className="expense-name">Transport</span>
                  <Tooltip content="Car payments, fuel, public transport" />
                </div>

                <div className="expense-warning">
                  {transportPercent.toFixed(0)}% of income
                </div>

                <div className="expense-amount number">
                  {formatCurrency(expenses.transport)}
                </div>
              </div>

              <div className="expense-item">
                <div className="expense-info">
                  <span className="expense-name">Food & Groceries</span>
                  <Tooltip content="Monthly grocery and dining expenses" />
                </div>
                <div className="expense-amount number">
                  {formatCurrency(expenses.food)}
                </div>
              </div>

              <div className="expense-item">
                <div className="expense-info">
                  <span className="expense-name">Entertainment</span>
                </div>
                <div className="expense-amount number">
                  {formatCurrency(expenses.entertainment)}
                </div>
              </div>

              <div className="expense-item">
                <div className="expense-info">
                  <span className="expense-name">Utilities</span>
                </div>
                <div className="expense-amount number">
                  {formatCurrency(expenses.utilities)}
                </div>
              </div>

              <div className="expense-item">
                <div className="expense-info">
                  <span className="expense-name">Insurance</span>
                </div>
                <div className="expense-amount number">
                  {formatCurrency(expenses.insurance)}
                </div>
              </div>

              <div className="expense-item">
                <div className="expense-info">
                  <span className="expense-name">Debt Repayments</span>
                  <Tooltip content="Monthly payments on loans and credit cards" />
                </div>
                <div className="expense-amount number">
                  {formatCurrency(expenses.debt)}
                </div>
              </div>

              <div className="expense-item savings-item">
                <div className="expense-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    fill="green"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="green"
                      stroke-width="2"
                      fill="none"
                    />
                    <path
                      d="M8 12l2 2 4-4"
                      stroke="green"
                      stroke-width="2"
                      fill="none"
                    />
                  </svg>
                  <span className="expense-name">Savings & Investments</span>
                  <Tooltip content="Monthly contributions to savings, RA, TFSA" />
                </div>
                <div className="expense-amount number success">
                  {formatCurrency(expenses.savings)}
                </div>
              </div>

              <div className="expense-total">
                <span className="total-label heading">Total Expenses</span>
                <span className="total-amount number">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Insights & Recommendations */}
        <div className="right-column">
          <div className="card insights-card">
            <div className="card-header">
              <h3>Insights & Recommendations</h3>
              <span className="ai-badge">AI Powered</span>
            </div>

            <div className="insight-message success-bg">
              <p className="body-text">
                Your current spending is within a healthy range, allowing you to
                contribute consistently towards your savings and investment
                goals. Consider increasing your monthly contribution slightly to
                accelerate your progress over time.
              </p>
            </div>

            <div className="insight-item warning">
              <div className="insight-icon">
                <AlertTriangle size={30} />
              </div>
              <div className="insight-content">
                <div className="insight-title heading">High Transport Cost</div>
                <div className="insight-description body-text">
                  You are spending {transportPercent.toFixed(0)}% of your income
                  on transport. Consider optimizing your route or exploring
                  public transport options.
                </div>
                <button className="insight-action">
                  View Recommendations →
                </button>
              </div>
            </div>

            <div className="insight-item success">
              <div className="insight-icon">
                <Lightbulb size={30} />
              </div>
              <div className="insight-content">
                <div className="insight-title heading">
                  Tax-Efficient Investing
                </div>
                <div className="insight-description body-text">
                  Consider increasing your Retirement Annuity (RA) contribution.
                  RA contributions are tax-deductible up to 27.5% of your
                  taxable income.
                </div>
                <button className="insight-action">Learn about RAs →</button>
              </div>
            </div>

            <div className="insight-item info">
              <div className="insight-icon">
                <BarChart3 size={30} />
              </div>
              <div className="insight-content">
                <div className="insight-title heading">
                  Emergency Fund Status
                </div>
                <div className="insight-description body-text">
                  Based on your expenses, you need approximately R
                  {Math.round(totalExpenses * 3).toLocaleString()}
                  for a 3-month emergency fund.
                </div>
                <button className="insight-action">
                  Build Emergency Fund →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Content */}
        <div className="card concepts-card">
          <div className="card-header">
            <h3>Financial Concepts Explained</h3>
          </div>

          <div className="concept-list">
            <div className="concept-item">
              <Wallet size={30} className="concept-icon" />
              <div className="concept-content">
                <h4 className="heading">Net Income</h4>
                <p className="body-text text-sm">
                  Your take-home pay after all deductions (tax, medical aid,
                  retirement contributions) and expenses. This is what you have
                  available to save and invest.
                </p>
              </div>
            </div>

            <div className="concept-item">
              <TrendingUp size={30} className="trend-icon" />
              <div className="concept-content">
                <h4 className="heading">Savings Rate</h4>
                <p className="body-text text-sm">
                  The percentage of your income that you save each month.
                  Financial experts recommend a savings rate of at least 15-20%
                  for long-term wealth building.
                </p>
              </div>
            </div>

            <div className="concept-item">
              <Scale size={30} className="concept-icon" />
              <div className="concept-content">
                <h4 className="heading">Debt-to-Income Ratio</h4>
                <p className="body-text text-sm">
                  Your total monthly debt payments divided by your gross monthly
                  income. Lenders prefer a DTI below 36% for home loan
                  approvals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Tooltip Component
function Tooltip({ content, children }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Info size={14} className="tooltip-icon" />
      {show && <div className="tooltip-content">{content}</div>}
    </div>
  );
}

export default MoneySnapshot;
