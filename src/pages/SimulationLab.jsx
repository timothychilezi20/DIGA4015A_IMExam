import { useState } from "react";
import Tooltip from "../components/Common/Tooltip";
import { formatCurrency } from "../utils/formatters";
import {
  calculateMonthlyMortgage,
  calculateInvestmentGrowth,
} from "../utils/calculations";
import "./SimulationLab.css";
import "../styles/main.css";

import {
  Home,
  Scale,
  Globe,
  BarChart3,
  Target,
  TrendingUp,
  Flag,
  CheckCircle2,
} from "lucide-react";

const rangeBackground = (value, min, max) => {
  const pct = ((value - min) / (max - min)) * 100;
  return `linear-gradient(to right, #a90c2b 0%, #a90c2b ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`;
};

function SimulationLab() {
  const [rentVsBuy, setRentVsBuy] = useState({
    monthlyRent: 12000,
    propertyPrice: 1200000,
    depositPercent: 10,
    interestRate: 11.5,
    years: 5,
    rentIncrease: 5,
    propertyAppreciation: 6,
  });

  const [carVsInvest, setCarVsInvest] = useState({
    carPrice: 350000,
    deposit: 50000,
    interestRate: 12,
    loanTerm: 5,
    monthlyUber: 4000,
    investmentReturn: 9,
  });

  const [rentVsBuyResult, setRentVsBuyResult] = useState(null);
  const [carVsInvestResult, setCarVsInvestResult] = useState(null);

  const calculateRentVsBuy = () => {
    const monthlyBond = calculateMonthlyMortgage(
      rentVsBuy.propertyPrice,
      rentVsBuy.depositPercent,
      rentVsBuy.interestRate,
      rentVsBuy.years,
    );

    let totalRent = 0;
    let currentRent = rentVsBuy.monthlyRent;
    for (let i = 0; i < rentVsBuy.years; i++) {
      totalRent += currentRent * 12;
      currentRent *= 1 + rentVsBuy.rentIncrease / 100;
    }

    const propertyValue =
      rentVsBuy.propertyPrice *
      Math.pow(1 + rentVsBuy.propertyAppreciation / 100, rentVsBuy.years);
    const totalBondPayments = monthlyBond * 12 * rentVsBuy.years;
    const equity =
      propertyValue -
      rentVsBuy.propertyPrice * (1 - rentVsBuy.depositPercent / 100);

    setRentVsBuyResult({
      monthlyBond,
      totalRent,
      propertyValue,
      totalBondPayments,
      equity,
      isBuyingBetter: propertyValue - totalBondPayments > totalRent,
      breakEvenYear: Math.ceil(
        ((rentVsBuy.propertyPrice * 0.1) / (rentVsBuy.monthlyRent * 12)) *
          rentVsBuy.years,
      ),
    });
  };

  const calculateCarVsInvest = () => {
    const loanAmount = carVsInvest.carPrice - carVsInvest.deposit;
    const monthlyRate = carVsInvest.interestRate / 100 / 12;
    const numberOfPayments = carVsInvest.loanTerm * 12;

    const monthlyCarPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalCarCost =
      monthlyCarPayment * numberOfPayments + carVsInvest.deposit;
    const carDepreciated =
      carVsInvest.carPrice * Math.pow(0.85, carVsInvest.loanTerm);

    const monthlySavings = carVsInvest.monthlyUber - monthlyCarPayment;
    const investmentValue = calculateInvestmentGrowth(
      0,
      Math.max(0, monthlySavings),
      carVsInvest.investmentReturn,
      carVsInvest.loanTerm,
    );

    setCarVsInvestResult({
      monthlyCarPayment,
      totalCarCost,
      carDepreciated,
      monthlySavings: monthlySavings > 0 ? monthlySavings : 0,
      investmentValue,
      isInvestingBetter: investmentValue > totalCarCost - carDepreciated,
      netDifference: investmentValue - (totalCarCost - carDepreciated),
    });
  };

  const handleRentVsBuyChange = (field, value) => {
    setRentVsBuy((prev) => ({ ...prev, [field]: value }));
  };

  const handleCarVsInvestChange = (field, value) => {
    setCarVsInvest((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Simulation Lab</h1>
        <p className="page-description">
          Test different financial scenarios and see how your decisions impact
          your wealth over time
        </p>
      </div>

      <div className="simulation-grid">
        {/* Rent vs Buy Simulation */}
        <div className="simulation-card">
          <div className="simulation-header">
            <div className="simulation-title-row">
              <House size={40} className="sim-icon" />
              <h3>Rent vs Buy in Johannesburg</h3>
            </div>
            <p>
              Compare the long-term financial impact of renting versus buying
              property
            </p>
          </div>

          <div className="simulation-content">
            <div className="input-group">
              <label>Monthly Rent (ZAR)</label>
              <div className="input-wrapper">
                <span className="input-currency">R</span>
                <input
                  type="number"
                  className="simulation-input"
                  value={rentVsBuy.monthlyRent}
                  onChange={(e) =>
                    handleRentVsBuyChange("monthlyRent", Number(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>Property Price (ZAR)</label>
              <div className="input-wrapper">
                <span className="input-currency">R</span>
                <input
                  type="number"
                  className="simulation-input"
                  value={rentVsBuy.propertyPrice}
                  onChange={(e) =>
                    handleRentVsBuyChange(
                      "propertyPrice",
                      Number(e.target.value),
                    )
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>Deposit Percentage (%)</label>
              <input
                type="range"
                className="range-input"
                min="0"
                max="30"
                step="5"
                value={rentVsBuy.depositPercent}
                style={{
                  background: rangeBackground(rentVsBuy.depositPercent, 0, 30),
                }}
                onChange={(e) =>
                  handleRentVsBuyChange(
                    "depositPercent",
                    Number(e.target.value),
                  )
                }
              />
              <div className="input-hint">
                {rentVsBuy.depositPercent}% ={" "}
                {formatCurrency(
                  (rentVsBuy.propertyPrice * rentVsBuy.depositPercent) / 100,
                )}
              </div>
            </div>

            <div className="input-group">
              <label>Interest Rate (%)</label>
              <input
                type="range"
                className="range-input"
                min="8"
                max="15"
                step="0.5"
                value={rentVsBuy.interestRate}
                style={{
                  background: rangeBackground(rentVsBuy.interestRate, 8, 15),
                }}
                onChange={(e) =>
                  handleRentVsBuyChange("interestRate", Number(e.target.value))
                }
              />
              <div className="input-hint">Current prime rate: 11.75%</div>
            </div>

            <div className="input-group">
              <label>Time Horizon (Years)</label>
              <input
                type="range"
                className="range-input"
                min="2"
                max="20"
                step="1"
                value={rentVsBuy.years}
                style={{
                  background: rangeBackground(rentVsBuy.years, 2, 20),
                }}
                onChange={(e) =>
                  handleRentVsBuyChange("years", Number(e.target.value))
                }
              />
              <div className="input-hint">{rentVsBuy.years} years</div>
            </div>

            <button className="run-btn" onClick={calculateRentVsBuy}>
              Run Simulation →
            </button>

            {rentVsBuyResult && (
              <div className="results-section">
                <h4>Results</h4>
                <div className="result-value">
                  Monthly Bond: {formatCurrency(rentVsBuyResult.monthlyBond)}
                </div>
                <div className="result-difference" style={{ marginTop: "8px" }}>
                  Total Rent ({rentVsBuy.years} years):{" "}
                  {formatCurrency(rentVsBuyResult.totalRent)}
                </div>
                <div className="result-difference">
                  Property Value after {rentVsBuy.years} years:{" "}
                  {formatCurrency(rentVsBuyResult.propertyValue)}
                </div>
                <div className="verdict">
                  <strong>Studio Verdict:</strong>
                  <p>
                    {rentVsBuyResult.isBuyingBetter
                      ? `Buying becomes more beneficial after approximately ${rentVsBuyResult.breakEvenYear} years. You'll build approximately ${formatCurrency(rentVsBuyResult.equity)} in equity.`
                      : `Renting is more cost-effective for shorter time horizons. Consider buying if you plan to stay for ${rentVsBuyResult.breakEvenYear}+ years.`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Car vs Invest Simulation */}
        <div className="simulation-card">
          <div className="simulation-header">
            <div className="simulation-title-row">
              <Car size={40} className="sim-icon" />
              <h3>Car Finance vs Uber + Invest</h3>
            </div>
            <p>
              Compare buying a car versus using ride-hailing and investing the
              savings
            </p>
          </div>

          <div className="simulation-content">
            <div className="input-group">
              <label>Car Price (ZAR)</label>
              <div className="input-wrapper">
                <span className="input-currency">R</span>
                <input
                  type="number"
                  className="simulation-input"
                  value={carVsInvest.carPrice}
                  onChange={(e) =>
                    handleCarVsInvestChange("carPrice", Number(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>Deposit (ZAR)</label>
              <div className="input-wrapper">
                <span className="input-currency">R</span>
                <input
                  type="number"
                  className="simulation-input"
                  value={carVsInvest.deposit}
                  onChange={(e) =>
                    handleCarVsInvestChange("deposit", Number(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>Monthly Uber/Bolt Spend (ZAR)</label>
              <div className="input-wrapper">
                <span className="input-currency">R</span>
                <input
                  type="number"
                  className="simulation-input"
                  value={carVsInvest.monthlyUber}
                  onChange={(e) =>
                    handleCarVsInvestChange(
                      "monthlyUber",
                      Number(e.target.value),
                    )
                  }
                />
              </div>
              <div className="input-hint">
                Average monthly transport cost without a car
              </div>
            </div>

            <div className="input-group">
              <label>Investment Return (%)</label>
              <input
                type="range"
                className="range-input"
                min="4"
                max="15"
                step="0.5"
                value={carVsInvest.investmentReturn}
                style={{
                  background: rangeBackground(
                    carVsInvest.investmentReturn,
                    4,
                    15,
                  ),
                }}
                onChange={(e) =>
                  handleCarVsInvestChange(
                    "investmentReturn",
                    Number(e.target.value),
                  )
                }
              />
              <div className="input-hint">
                Expected annual return from investing
              </div>
            </div>

            <button className="run-btn" onClick={calculateCarVsInvest}>
              Run Simulation →
            </button>

            {carVsInvestResult && (
              <div className="results-section">
                <h4>Results</h4>
                <div className="result-value">
                  Monthly Payment:{" "}
                  {formatCurrency(carVsInvestResult.monthlyCarPayment)}
                </div>
                <div className="result-difference">
                  Total Car Cost:{" "}
                  {formatCurrency(carVsInvestResult.totalCarCost)}
                </div>
                <div className="result-difference">
                  Car Value After {carVsInvest.loanTerm} years:{" "}
                  {formatCurrency(carVsInvestResult.carDepreciated)}
                </div>
                <div className="result-difference positive">
                  Investment Value:{" "}
                  {formatCurrency(carVsInvestResult.investmentValue)}
                </div>
                <div className="verdict">
                  <strong>Studio Verdict:</strong>
                  <p>
                    {carVsInvestResult.isInvestingBetter
                      ? `Using Uber/Bolt and investing the difference could leave you ${formatCurrency(carVsInvestResult.netDifference)} better off after ${carVsInvest.loanTerm} years.`
                      : `Buying a car makes more financial sense given your usage pattern and the depreciation curve.`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Educational Section */}
      <div className="education-section" style={{ marginTop: "2rem" }}>
        <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Understanding These Scenarios
        </h3>
        <div
          className="education-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          <div className="edu-tip">
            <strong>Property Considerations</strong>
            <p>
              In South Africa, transfer duty applies to properties over R1.1
              million. Factor in bond registration costs (approx R30,000) and
              transfer fees (approx 1% of property value).
            </p>
          </div>
          <div className="edu-tip">
            <strong>Depreciation Reality</strong>
            <p>
              A new car loses 15-20% of its value in the first year and about
              10% each year after. After 5 years, most cars are worth only
              40-50% of their purchase price.
            </p>
          </div>
          <div className="edu-tip">
            <strong>Opportunity Cost</strong>
            <p>
              Money spent on a car deposit and monthly payments could be
              invested in equities earning 8-12% annually in a TFSA or RA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulationLab;
