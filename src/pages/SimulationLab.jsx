import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { formatCurrency } from "../utils/formatters";
import {
  calculateMonthlyMortgage,
  calculateInvestmentGrowth,
} from "../utils/calculations";
import "./SimulationLab.css";
import "../styles/main.css";

import { House, Car, Globe, Clock } from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const rangeBackground = (value, min, max) => {
  const pct = ((value - min) / (max - min)) * 100;
  return `linear-gradient(to right, #a90c2b 0%, #a90c2b ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`;
};

const SIM_LABELS = {
  "rent-vs-buy": "Rent vs Buy",
  "car-vs-invest": "Car vs Invest",
  "local-vs-offshore": "Local vs Offshore",
};

const SIM_ICONS = {
  "rent-vs-buy": House,
  "car-vs-invest": Car,
  "local-vs-offshore": Globe,
};

function SimulationLab() {
  const { userProfile, saveSimulation, simulationHistory } = useUser();

  const [rentVsBuy, setRentVsBuy] = useState({
    monthlyIncome: userProfile.monthlyIncome || 40000,
    monthlyRent: 13000,
    propertyPrice: 2000000,
    depositPercent: 10,
    interestRate: 10.25,
    years: 5,
    rentIncrease: 5,
    propertyAppreciation: 6,
  });

  const [carVsInvest, setCarVsInvest] = useState({
    monthlyIncome: userProfile.monthlyIncome || 35000,
    carPriceA: 250000,
    carPriceB: 450000,
    depositPercent: 10,
    interestRate: 13,
    investmentReturn: 9,
    years: 5,
  });

  const [localVsOffshore, setLocalVsOffshore] = useState({
    monthlyContribution: 3000,
    localAllocation: 60,
    localReturn: 8,
    offshoreReturn: 10,
    years: 5,
  });

  const [rentVsBuyResult, setRentVsBuyResult] = useState(null);
  const [carVsInvestResult, setCarVsInvestResult] = useState(null);
  const [localVsOffshoreResult, setLocalVsOffshoreResult] = useState(null);

  // ── Auto-calculate on input changes ─────────────────────────────────────────

  useEffect(() => {
    calculateRentVsBuy();
  }, [rentVsBuy]);

  useEffect(() => {
    calculateCarVsInvest();
  }, [carVsInvest]);

  useEffect(() => {
    calculateLocalVsOffshore();
  }, [localVsOffshore]);

  // ── Rent vs Buy ────────────────────────────────────────────────────────────

  const calculateRentVsBuy = () => {
    const {
      monthlyIncome,
      monthlyRent,
      propertyPrice,
      depositPercent,
      interestRate,
      years,
      rentIncrease,
      propertyAppreciation,
    } = rentVsBuy;

    const depositAmount = (propertyPrice * depositPercent) / 100;
    const loanAmount = propertyPrice - depositAmount;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = years * 12;

    const bondRegistrationCost = Math.round(loanAmount * 0.015 + 10000);
    const transferDuty =
      propertyPrice > 1100000
        ? Math.round((propertyPrice - 1100000) * 0.03 + 33000)
        : 0;
    const totalUpfrontCosts =
      depositAmount + bondRegistrationCost + transferDuty;

    const monthlyBond =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    let totalRent = 0;
    let currentRent = monthlyRent;
    for (let i = 0; i < years; i++) {
      totalRent += currentRent * 12;
      currentRent *= 1 + rentIncrease / 100;
    }

    const propertyValue =
      propertyPrice * Math.pow(1 + propertyAppreciation / 100, years);
    const totalBondPayments = monthlyBond * totalPayments;
    const totalInterestPaid = totalBondPayments - loanAmount;

    let remainingBalance = loanAmount;
    for (let m = 0; m < totalPayments; m++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyBond - interestPayment;
      remainingBalance -= principalPayment;
    }
    const equity = propertyValue - Math.max(0, remainingBalance);

    let breakEvenYear = null;
    for (let yr = 1; yr <= 30; yr++) {
      const yrPayments = yr * 12;
      const yrPropertyValue =
        propertyPrice * Math.pow(1 + propertyAppreciation / 100, yr);
      let yrBalance = loanAmount;
      for (let m = 0; m < yrPayments; m++) {
        const interest = yrBalance * monthlyRate;
        yrBalance -= monthlyBond - interest;
      }
      const yrEquity = yrPropertyValue - Math.max(0, yrBalance);
      const yrBuyingCost = monthlyBond * yrPayments + totalUpfrontCosts;

      let yrRent = 0;
      let rent = monthlyRent;
      for (let i = 0; i < yr; i++) {
        yrRent += rent * 12;
        rent *= 1 + rentIncrease / 100;
      }

      if (yrEquity - yrBuyingCost > -yrRent) {
        breakEvenYear = yr;
        break;
      }
    }

    const chartData = Array.from({ length: years + 1 }, (_, yr) => {
      let yrRent = 0;
      let rent = monthlyRent;
      for (let i = 0; i < yr; i++) {
        yrRent += rent * 12;
        rent *= 1 + rentIncrease / 100;
      }
      const yrPropertyValue =
        propertyPrice * Math.pow(1 + propertyAppreciation / 100, yr);
      let yrBalance = loanAmount;
      for (let m = 0; m < yr * 12; m++) {
        const interest = yrBalance * monthlyRate;
        yrBalance -= monthlyBond - interest;
      }
      const yrEquity = yrPropertyValue - Math.max(0, yrBalance);
      const yrBuyingNet = yrEquity - monthlyBond * yr * 12 - totalUpfrontCosts;

      return {
        year: `Yr ${yr}`,
        "Buying net position": Math.round(yrBuyingNet),
        "Renting net position": Math.round(-yrRent),
      };
    });

    const results = {
      monthlyBond,
      totalRent,
      propertyValue,
      totalBondPayments,
      totalInterestPaid,
      equity,
      depositAmount,
      bondRegistrationCost,
      transferDuty,
      totalUpfrontCosts,
      breakEvenYear,
      chartData,
      isBuyingBetter: equity > totalRent,
      affordabilityRatio: (monthlyBond / monthlyIncome) * 100,
    };

    setRentVsBuyResult(results);

    // saveSimulation called here, inside the function, where variables are in scope
    saveSimulation({
      type: "rent-vs-buy",
      inputs: rentVsBuy,
      results: {
        equity,
        totalRent,
        monthlyBond,
        breakEvenYear,
        affordabilityRatio: (monthlyBond / monthlyIncome) * 100,
      },
    });
  };

  // ── Car vs Invest ──────────────────────────────────────────────────────────

  const calculateCarVsInvest = () => {
    const {
      monthlyIncome,
      carPriceA,
      carPriceB,
      depositPercent,
      interestRate,
      investmentReturn,
      years,
    } = carVsInvest;

    const calcCar = (price) => {
      const deposit = (price * depositPercent) / 100;
      const loanAmount = price - deposit;
      const monthlyRate = interestRate / 100 / 12;
      const numPayments = years * 12;

      const monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);

      const totalFinanceCost = monthlyPayment * numPayments + deposit;
      const totalInterest = monthlyPayment * numPayments - loanAmount;

      const annualInsurance = price * 0.015;
      const annualMaintenance = price * 0.01;
      const totalRunningCosts = (annualInsurance + annualMaintenance) * years;

      const depreciatedValue = price * 0.85 * Math.pow(0.9, years - 1);
      const totalDepreciation = price - depreciatedValue;

      const totalCostOfOwnership =
        totalFinanceCost + totalRunningCosts + totalDepreciation;

      return {
        deposit,
        monthlyPayment,
        totalFinanceCost,
        totalInterest,
        annualInsurance,
        annualMaintenance,
        totalRunningCosts,
        depreciatedValue,
        totalDepreciation,
        totalCostOfOwnership,
      };
    };

    const carA = calcCar(carPriceA);
    const carB = calcCar(carPriceB);

    const monthlySaving = carB.monthlyPayment - carA.monthlyPayment;
    const monthlyRate = investmentReturn / 100 / 12;
    const numMonths = years * 12;

    const investmentValue =
      monthlySaving > 0
        ? monthlySaving *
          ((Math.pow(1 + monthlyRate, numMonths) - 1) / monthlyRate)
        : 0;

    const totalSaved = monthlySaving * numMonths;
    const investmentGain = investmentValue - totalSaved;

    const chartData = Array.from({ length: years + 1 }, (_, yr) => {
      const yrMonths = yr * 12;
      const yrInvestment =
        monthlySaving > 0
          ? monthlySaving *
            ((Math.pow(1 + monthlyRate, yrMonths) - 1) / monthlyRate)
          : 0;
      const yrCostA = carA.monthlyPayment * yrMonths + carA.deposit;
      const yrCostB = carB.monthlyPayment * yrMonths + carB.deposit;

      return {
        year: `Yr ${yr}`,
        "Car A total cost": Math.round(yrCostA),
        "Car B total cost": Math.round(yrCostB),
        "Investment growth": Math.round(yrInvestment),
      };
    });

    const netWorthDifference =
      investmentValue + carB.totalCostOfOwnership - carA.totalCostOfOwnership;

    const affordabilityA = (carA.monthlyPayment / monthlyIncome) * 100;
    const affordabilityB = (carB.monthlyPayment / monthlyIncome) * 100;

    setCarVsInvestResult({
      carA,
      carB,
      monthlySaving,
      investmentValue,
      totalSaved,
      investmentGain,
      chartData,
      netWorthDifference,
      affordabilityA,
      affordabilityB,
    });

    // saveSimulation called here, inside the function, where variables are in scope
    saveSimulation({
      type: "car-vs-invest",
      inputs: carVsInvest,
      results: {
        investmentValue,
        netWorthDifference,
        monthlySaving,
      },
    });
  };

  // ── Local vs Offshore ──────────────────────────────────────────────────────

  const calculateLocalVsOffshore = () => {
    const {
      monthlyContribution,
      localAllocation,
      localReturn,
      offshoreReturn,
      years,
    } = localVsOffshore;

    const offshoreAllocation = 100 - localAllocation;
    const monthlyLocal = (monthlyContribution * localAllocation) / 100;
    const monthlyOffshore = (monthlyContribution * offshoreAllocation) / 100;

    const growPortfolio = (monthly, annualReturn, numYears) => {
      const monthlyRate = annualReturn / 100 / 12;
      return (
        monthly * ((Math.pow(1 + monthlyRate, numYears * 12) - 1) / monthlyRate)
      );
    };

    const chartData = Array.from({ length: years + 1 }, (_, yr) => {
      const allLocal = growPortfolio(monthlyContribution, localReturn, yr);
      const allOffshore = growPortfolio(
        monthlyContribution,
        offshoreReturn,
        yr,
      );
      const mixed =
        growPortfolio(monthlyLocal, localReturn, yr) +
        growPortfolio(monthlyOffshore, offshoreReturn, yr);
      return {
        year: `Yr ${yr}`,
        "100% Local": Math.round(allLocal),
        Diversified: Math.round(mixed),
        "100% Offshore": Math.round(allOffshore),
      };
    });

    const finalLocal = growPortfolio(monthlyContribution, localReturn, years);
    const finalOffshore = growPortfolio(
      monthlyContribution,
      offshoreReturn,
      years,
    );
    const finalMixed =
      growPortfolio(monthlyLocal, localReturn, years) +
      growPortfolio(monthlyOffshore, offshoreReturn, years);

    const totalContributed = monthlyContribution * 12 * years;

    let riskLevel, riskColor;
    if (offshoreAllocation <= 20) {
      riskLevel = "Conservative";
      riskColor = "#10B981";
    } else if (offshoreAllocation <= 50) {
      riskLevel = "Moderate";
      riskColor = "#F59E0B";
    } else if (offshoreAllocation <= 75) {
      riskLevel = "Balanced";
      riskColor = "#3B82F6";
    } else {
      riskLevel = "Aggressive";
      riskColor = "#EF4444";
    }

    const bestStrategy =
      finalMixed >= finalOffshore && finalMixed >= finalLocal
        ? "Diversified"
        : finalOffshore >= finalLocal
          ? "100% Offshore"
          : "100% Local";

    setLocalVsOffshoreResult({
      chartData,
      finalLocal,
      finalOffshore,
      finalMixed,
      totalContributed,
      riskLevel,
      riskColor,
      localAllocation,
      offshoreAllocation,
      bestStrategy,
    });

    saveSimulation({
      type: "local-vs-offshore",
      inputs: localVsOffshore,
      results: {
        finalLocal,
        finalOffshore,
        finalMixed,
        bestStrategy,
      },
    });
  };

  // ── Change handlers ────────────────────────────────────────────────────────

  const handleRentVsBuyChange = (field, value) => {
    setRentVsBuy((prev) => ({ ...prev, [field]: value }));
  };

  const handleCarVsInvestChange = (field, value) => {
    setCarVsInvest((prev) => ({ ...prev, [field]: value }));
  };

  // This was missing from the original — used throughout the Local vs Offshore section
  const handleLocalVsOffshoreChange = (field, value) => {
    setLocalVsOffshore((prev) => ({ ...prev, [field]: value }));
  };

  // ── Load simulation from history ────────────────────────────────────────────

  const loadSimulationFromHistory = (sim) => {
    if (sim.type === "rent-vs-buy" && sim.inputs) {
      setRentVsBuy(sim.inputs);
    } else if (sim.type === "car-vs-invest" && sim.inputs) {
      setCarVsInvest(sim.inputs);
    } else if (sim.type === "local-vs-offshore" && sim.inputs) {
      setLocalVsOffshore(sim.inputs);
    }

    // Scroll to the simulation card
    setTimeout(() => {
      const simCard = document.querySelector(".simulation-card--wide, .simulation-card");
      if (simCard) {
        simCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);
  };

  // ── Helpers for history display ────────────────────────────────────────────

  const formatHistoryResults = (type, results) => {
    if (!results) return [];
    switch (type) {
      case "rent-vs-buy":
        return [
          { label: "Monthly bond", value: formatCurrency(results.monthlyBond) },
          { label: "Equity built", value: formatCurrency(results.equity) },
          {
            label: "Break-even",
            value: results.breakEvenYear
              ? `Year ${results.breakEvenYear}`
              : "Not reached",
          },
          {
            label: "Affordability",
            value: `${Math.round(results.affordabilityRatio)}% of income`,
          },
        ];
      case "car-vs-invest":
        return [
          {
            label: "Monthly saving",
            value: formatCurrency(results.monthlySaving),
          },
          {
            label: "Investment value",
            value: formatCurrency(results.investmentValue),
          },
          {
            label: "Net worth gain",
            value: formatCurrency(results.netWorthDifference),
          },
        ];
      case "local-vs-offshore":
        return [
          {
            label: "100% Local",
            value: formatCurrency(results.finalLocal),
          },
          {
            label: "Diversified",
            value: formatCurrency(results.finalMixed),
          },
          {
            label: "100% Offshore",
            value: formatCurrency(results.finalOffshore),
          },
          { label: "Best strategy", value: results.bestStrategy },
        ];
      default:
        return [];
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

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
        {/* Rent vs Buy */}
        <div className="simulation-card simulation-card--wide">
          <div className="simulation-hero simulation-hero--rent-vs-buy">
            <div className="simulation-hero-orb simulation-hero-orb--1" />
            <div className="simulation-hero-orb simulation-hero-orb--2" />
            <div className="simulation-hero-content">
              <div className="simulation-hero-icon">
                <House size={32} />
              </div>
              <h2>Rent vs Buy</h2>
              <p>
                Make one of life's biggest financial decisions with data and
                clarity.
              </p>
              <ul className="simulation-hero-features">
                <li>Calculate long-term equity building</li>
                <li>Compare total costs over time</li>
                <li>Factor in South African transfer duties</li>
              </ul>
            </div>
          </div>

          <div className="simulation-body">
            <div className="simulation-inputs">
              <div className="input-group">
                <label>Monthly Income</label>
                <div className="input-wrapper">
                  <span className="input-currency">R</span>
                  <input
                    type="number"
                    className="simulation-input"
                    value={rentVsBuy.monthlyIncome}
                    onChange={(e) =>
                      handleRentVsBuyChange(
                        "monthlyIncome",
                        Number(e.target.value),
                      )
                    }
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Monthly Rent</label>
                <div className="input-wrapper">
                  <span className="input-currency">R</span>
                  <input
                    type="number"
                    className="simulation-input"
                    value={rentVsBuy.monthlyRent}
                    onChange={(e) =>
                      handleRentVsBuyChange(
                        "monthlyRent",
                        Number(e.target.value),
                      )
                    }
                  />
                </div>
                <span className="input-hint">
                  Johannesburg avg: R8,000–R18,000/month
                </span>
              </div>

              <div className="input-group">
                <label>Property Price</label>
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
                <span className="input-hint">
                  Transfer duty applies above R1.1M
                </span>
              </div>

              <div className="input-group">
                <label>
                  Deposit — {rentVsBuy.depositPercent}% (
                  {formatCurrency(
                    (rentVsBuy.propertyPrice * rentVsBuy.depositPercent) / 100,
                  )}
                  )
                </label>
                <input
                  type="range"
                  className="range-input"
                  min="0"
                  max="30"
                  step="5"
                  value={rentVsBuy.depositPercent}
                  style={{
                    background: rangeBackground(
                      rentVsBuy.depositPercent,
                      0,
                      30,
                    ),
                  }}
                  onChange={(e) =>
                    handleRentVsBuyChange(
                      "depositPercent",
                      Number(e.target.value),
                    )
                  }
                />
              </div>

              <div className="input-group">
                <label>Interest Rate — {rentVsBuy.interestRate}%</label>
                <input
                  type="range"
                  className="range-input"
                  min="8"
                  max="15"
                  step="0.25"
                  value={rentVsBuy.interestRate}
                  style={{
                    background: rangeBackground(rentVsBuy.interestRate, 8, 15),
                  }}
                  onChange={(e) =>
                    handleRentVsBuyChange(
                      "interestRate",
                      Number(e.target.value),
                    )
                  }
                />
                <span className="input-hint">
                  SA prime rate: 11.75% | Typical bond rate: prime – 0.5% to
                  prime + 2%
                </span>
              </div>

              <div className="input-group">
                <label>Time Horizon — {rentVsBuy.years} years</label>
                <input
                  type="range"
                  className="range-input"
                  min="1"
                  max="20"
                  step="1"
                  value={rentVsBuy.years}
                  style={{
                    background: rangeBackground(rentVsBuy.years, 1, 20),
                  }}
                  onChange={(e) =>
                    handleRentVsBuyChange("years", Number(e.target.value))
                  }
                />
              </div>
            </div>

            {rentVsBuyResult ? (
              <div className="results-panel">
                <p className="results-label">Results</p>

                <div
                  className="risk-badge"
                  style={{
                    background:
                      rentVsBuyResult.affordabilityRatio <= 30
                        ? "#10B98118"
                        : rentVsBuyResult.affordabilityRatio <= 40
                          ? "#F59E0B18"
                          : "#EF444418",
                    color:
                      rentVsBuyResult.affordabilityRatio <= 30
                        ? "#10B981"
                        : rentVsBuyResult.affordabilityRatio <= 40
                          ? "#F59E0B"
                          : "#EF4444",
                    borderColor:
                      rentVsBuyResult.affordabilityRatio <= 30
                        ? "#10B98140"
                        : rentVsBuyResult.affordabilityRatio <= 40
                          ? "#F59E0B40"
                          : "#EF444440",
                  }}
                >
                  Bond is {Math.round(rentVsBuyResult.affordabilityRatio)}% of
                  income
                  {rentVsBuyResult.affordabilityRatio <= 30
                    ? " — Affordable"
                    : rentVsBuyResult.affordabilityRatio <= 40
                      ? " — Stretching"
                      : " — High risk"}
                </div>

                <div className="strategy-row">
                  <div className="stat-group">
                    <span className="stat-label">Monthly bond</span>
                    <span className="stat-value">
                      {formatCurrency(rentVsBuyResult.monthlyBond)}
                    </span>
                  </div>
                  <div className="stat-group">
                    <span className="stat-label">Monthly rent</span>
                    <span className="stat-value">
                      {formatCurrency(rentVsBuy.monthlyRent)}
                    </span>
                  </div>
                </div>

                <div className="strategy-row">
                  <div className="stat-group">
                    <span className="stat-label">
                      Total buying cost ({rentVsBuy.years} yrs)
                    </span>
                    <span className="stat-value negative">
                      {formatCurrency(
                        rentVsBuyResult.totalBondPayments +
                          rentVsBuyResult.totalUpfrontCosts,
                      )}
                    </span>
                  </div>
                  <div className="stat-group">
                    <span className="stat-label">
                      Total rent ({rentVsBuy.years} yrs)
                    </span>
                    <span className="stat-value negative">
                      {formatCurrency(rentVsBuyResult.totalRent)}
                    </span>
                  </div>
                </div>

                <div className="stat-group">
                  <span className="stat-label">Upfront costs breakdown</span>
                  <div className="breakdown-list">
                    <div className="breakdown-item">
                      <span>Deposit</span>
                      <span>
                        {formatCurrency(rentVsBuyResult.depositAmount)}
                      </span>
                    </div>
                    <div className="breakdown-item">
                      <span>Bond registration</span>
                      <span>
                        {formatCurrency(rentVsBuyResult.bondRegistrationCost)}
                      </span>
                    </div>
                    <div className="breakdown-item">
                      <span>Transfer duty</span>
                      <span>
                        {rentVsBuyResult.transferDuty > 0
                          ? formatCurrency(rentVsBuyResult.transferDuty)
                          : "Exempt (under R1.1M)"}
                      </span>
                    </div>
                    <div className="breakdown-item breakdown-item--total">
                      <span>Total upfront</span>
                      <span>
                        {formatCurrency(rentVsBuyResult.totalUpfrontCosts)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="stat-group">
                  <span className="stat-label">
                    Equity after {rentVsBuy.years} years
                  </span>
                  <span className="stat-value positive">
                    {formatCurrency(rentVsBuyResult.equity)}
                  </span>
                </div>

                <div className="chart-section">
                  <p className="chart-label">Net position over time</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={rentVsBuyResult.chartData}>
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) =>
                          v >= 1000000
                            ? `R${(v / 1000000).toFixed(1)}M`
                            : v <= -1000000
                              ? `-R${(Math.abs(v) / 1000000).toFixed(1)}M`
                              : `R${(v / 1000).toFixed(0)}K`
                        }
                      />
                      <Tooltip
                        formatter={(value) => [formatCurrency(value)]}
                        contentStyle={{
                          fontSize: "12px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Buying net position"
                        stroke="#a90c2b"
                        strokeWidth={2.5}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="Renting net position"
                        stroke="#6b7280"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    <span>
                      <span
                        className="legend-dot"
                        style={{ background: "#a90c2b" }}
                      />
                      Buying
                    </span>
                    <span>
                      <span
                        className="legend-dot"
                        style={{ background: "#6b7280" }}
                      />
                      Renting
                    </span>
                  </div>
                </div>

                <div className="verdict">
                  <strong>Verdict</strong>
                  <p>
                    {rentVsBuyResult.breakEvenYear
                      ? `Buying begins to work in your favour financially after ${rentVsBuyResult.breakEvenYear} year${rentVsBuyResult.breakEvenYear !== 1 ? "s" : ""}. You'll accumulate ${formatCurrency(rentVsBuyResult.equity)} in equity over ${rentVsBuy.years} years.`
                      : `Over this time horizon renting remains more cost-effective. Consider a longer horizon or a larger deposit to improve the buying case.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="results-panel results-panel--empty">
                <House size={32} strokeWidth={1.5} color="#d1d5db" />
                <p>
                  Adjust the inputs and run the simulation to see your property
                  comparison.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Car vs Invest */}
        <div className="simulation-card simulation-card--wide">
          <div className="simulation-hero simulation-hero--car-vs-invest">
            <div className="simulation-hero-orb simulation-hero-orb--1" />
            <div className="simulation-hero-orb simulation-hero-orb--2" />
            <div className="simulation-hero-content">
              <div className="simulation-hero-icon">
                <Car size={32} />
              </div>
              <h2>Luxury Car vs Invest</h2>
              <p>
                See what happens when you choose the modest car and invest the
                difference.
              </p>
              <ul className="simulation-hero-features">
                <li>Calculate depreciation and running costs</li>
                <li>Project investment growth over time</li>
                <li>Compare net worth outcomes</li>
              </ul>
            </div>
          </div>

          <div className="simulation-body">
            <div className="simulation-inputs">
              <div className="input-group">
                <label>Monthly Income</label>
                <div className="input-wrapper">
                  <span className="input-currency">R</span>
                  <input
                    type="number"
                    className="simulation-input"
                    value={carVsInvest.monthlyIncome}
                    onChange={(e) =>
                      handleCarVsInvestChange(
                        "monthlyIncome",
                        Number(e.target.value),
                      )
                    }
                  />
                </div>
              </div>

              <div className="strategy-row">
                <div className="input-group">
                  <label>Car A price</label>
                  <div className="input-wrapper">
                    <span className="input-currency">R</span>
                    <input
                      type="number"
                      className="simulation-input"
                      value={carVsInvest.carPriceA}
                      onChange={(e) =>
                        handleCarVsInvestChange(
                          "carPriceA",
                          Number(e.target.value),
                        )
                      }
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Car B price</label>
                  <div className="input-wrapper">
                    <span className="input-currency">R</span>
                    <input
                      type="number"
                      className="simulation-input"
                      value={carVsInvest.carPriceB}
                      onChange={(e) =>
                        handleCarVsInvestChange(
                          "carPriceB",
                          Number(e.target.value),
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label>
                  Deposit — {carVsInvest.depositPercent}% (
                  {formatCurrency(
                    (carVsInvest.carPriceA * carVsInvest.depositPercent) / 100,
                  )}{" "}
                  /{" "}
                  {formatCurrency(
                    (carVsInvest.carPriceB * carVsInvest.depositPercent) / 100,
                  )}
                  )
                </label>
                <input
                  type="range"
                  className="range-input"
                  min="0"
                  max="50"
                  step="5"
                  value={carVsInvest.depositPercent}
                  style={{
                    background: rangeBackground(
                      carVsInvest.depositPercent,
                      0,
                      50,
                    ),
                  }}
                  onChange={(e) =>
                    handleCarVsInvestChange(
                      "depositPercent",
                      Number(e.target.value),
                    )
                  }
                />
              </div>

              <div className="input-group">
                <label>
                  Finance Interest Rate — {carVsInvest.interestRate}%
                </label>
                <input
                  type="range"
                  className="range-input"
                  min="8"
                  max="20"
                  step="0.5"
                  value={carVsInvest.interestRate}
                  style={{
                    background: rangeBackground(
                      carVsInvest.interestRate,
                      8,
                      20,
                    ),
                  }}
                  onChange={(e) =>
                    handleCarVsInvestChange(
                      "interestRate",
                      Number(e.target.value),
                    )
                  }
                />
                <span className="input-hint">
                  SA vehicle finance: typically prime + 1% to prime + 4%
                </span>
              </div>

              <div className="input-group">
                <label>
                  Investment Return — {carVsInvest.investmentReturn}%
                </label>
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
                <span className="input-hint">
                  Expected annual return if difference is invested
                </span>
              </div>

              <div className="input-group">
                <label>Time Horizon — {carVsInvest.years} years</label>
                <input
                  type="range"
                  className="range-input"
                  min="1"
                  max="10"
                  step="1"
                  value={carVsInvest.years}
                  style={{
                    background: rangeBackground(carVsInvest.years, 1, 10),
                  }}
                  onChange={(e) =>
                    handleCarVsInvestChange("years", Number(e.target.value))
                  }
                />
              </div>
            </div>

            {carVsInvestResult ? (
              <div className="results-panel">
                <p className="results-label">Results</p>

                <div className="strategy-row">
                  <div
                    className="risk-badge"
                    style={{
                      background:
                        carVsInvestResult.affordabilityA <= 20
                          ? "#10B98118"
                          : carVsInvestResult.affordabilityA <= 30
                            ? "#F59E0B18"
                            : "#EF444418",
                      color:
                        carVsInvestResult.affordabilityA <= 20
                          ? "#10B981"
                          : carVsInvestResult.affordabilityA <= 30
                            ? "#F59E0B"
                            : "#EF4444",
                      borderColor:
                        carVsInvestResult.affordabilityA <= 20
                          ? "#10B98140"
                          : carVsInvestResult.affordabilityA <= 30
                            ? "#F59E0B40"
                            : "#EF444440",
                    }}
                  >
                    Car A: {Math.round(carVsInvestResult.affordabilityA)}% of
                    income
                  </div>
                  <div
                    className="risk-badge"
                    style={{
                      background:
                        carVsInvestResult.affordabilityB <= 20
                          ? "#10B98118"
                          : carVsInvestResult.affordabilityB <= 30
                            ? "#F59E0B18"
                            : "#EF444418",
                      color:
                        carVsInvestResult.affordabilityB <= 20
                          ? "#10B981"
                          : carVsInvestResult.affordabilityB <= 30
                            ? "#F59E0B"
                            : "#EF4444",
                      borderColor:
                        carVsInvestResult.affordabilityB <= 20
                          ? "#10B98140"
                          : carVsInvestResult.affordabilityB <= 30
                            ? "#F59E0B40"
                            : "#EF444440",
                    }}
                  >
                    Car B: {Math.round(carVsInvestResult.affordabilityB)}% of
                    income
                  </div>
                </div>

                <div className="car-comparison-grid">
                  <div className="car-col">
                    <p className="car-col-label">
                      Car A — {formatCurrency(carVsInvest.carPriceA)}
                    </p>
                    <div className="breakdown-list">
                      <div className="breakdown-item">
                        <span>Monthly payment</span>
                        <span>
                          {formatCurrency(
                            carVsInvestResult.carA.monthlyPayment,
                          )}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span>Total interest</span>
                        <span>
                          {formatCurrency(carVsInvestResult.carA.totalInterest)}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span>Insurance ({carVsInvest.years} yrs)</span>
                        <span>
                          {formatCurrency(
                            carVsInvestResult.carA.annualInsurance *
                              carVsInvest.years,
                          )}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span>Maintenance ({carVsInvest.years} yrs)</span>
                        <span>
                          {formatCurrency(
                            carVsInvestResult.carA.annualMaintenance *
                              carVsInvest.years,
                          )}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span>Depreciation</span>
                        <span>
                          {formatCurrency(
                            carVsInvestResult.carA.totalDepreciation,
                          )}
                        </span>
                      </div>
                      <div className="breakdown-item breakdown-item--total">
                        <span>Total cost</span>
                        <span>
                          {formatCurrency(
                            carVsInvestResult.carA.totalCostOfOwnership,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="car-col car-col--b">
                    <p className="car-col-label">
                      Car B — {formatCurrency(carVsInvest.carPriceB)}
                    </p>
                    <div className="breakdown-list">
                      <div className="breakdown-item">
                        <span>Monthly payment</span>
                        <span>
                          {formatCurrency(
                            carVsInvestResult.carB.monthlyPayment,
                          )}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span>Total interest</span>
                        <span>
                          {formatCurrency(carVsInvestResult.carB.totalInterest)}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span>Insurance ({carVsInvest.years} yrs)</span>
                        <span>
                          {formatCurrency(
                            carVsInvestResult.carB.annualInsurance *
                              carVsInvest.years,
                          )}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span>Maintenance ({carVsInvest.years} yrs)</span>
                        <span>
                          {formatCurrency(
                            carVsInvestResult.carB.annualMaintenance *
                              carVsInvest.years,
                          )}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span>Depreciation</span>
                        <span>
                          {formatCurrency(
                            carVsInvestResult.carB.totalDepreciation,
                          )}
                        </span>
                      </div>
                      <div className="breakdown-item breakdown-item--total">
                        <span>Total cost</span>
                        <span>
                          {formatCurrency(
                            carVsInvestResult.carB.totalCostOfOwnership,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="stat-group">
                  <span className="stat-label">
                    Monthly saving (Car A vs B)
                  </span>
                  <span className="stat-value positive">
                    {formatCurrency(carVsInvestResult.monthlySaving)}/month
                  </span>
                </div>

                <div className="stat-group">
                  <span className="stat-label">
                    Investment value if difference invested
                  </span>
                  <span className="stat-value positive">
                    {formatCurrency(carVsInvestResult.investmentValue)}
                  </span>
                </div>

                <div className="chart-section">
                  <p className="chart-label">
                    Cost vs investment growth over time
                  </p>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={carVsInvestResult.chartData}>
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) =>
                          v >= 1000000
                            ? `R${(v / 1000000).toFixed(1)}M`
                            : `R${(v / 1000).toFixed(0)}K`
                        }
                      />
                      <Tooltip
                        formatter={(value) => [formatCurrency(value)]}
                        contentStyle={{
                          fontSize: "12px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Car A total cost"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="Car B total cost"
                        stroke="#EF4444"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="Investment growth"
                        stroke="#a90c2b"
                        strokeWidth={2.5}
                        dot={false}
                        strokeDasharray="5 3"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    <span>
                      <span
                        className="legend-dot"
                        style={{ background: "#10B981" }}
                      />
                      Car A cost
                    </span>
                    <span>
                      <span
                        className="legend-dot"
                        style={{ background: "#EF4444" }}
                      />
                      Car B cost
                    </span>
                    <span>
                      <span
                        className="legend-dot"
                        style={{ background: "#a90c2b" }}
                      />
                      Investment growth
                    </span>
                  </div>
                </div>

                <div className="verdict">
                  <strong>Verdict</strong>
                  <p>
                    Choosing Car A over Car B and investing the{" "}
                    {formatCurrency(carVsInvestResult.monthlySaving)}/month
                    difference could increase your net worth by{" "}
                    <strong>
                      {formatCurrency(carVsInvestResult.netWorthDifference)}
                    </strong>{" "}
                    over {carVsInvest.years} years. Car B costs{" "}
                    {formatCurrency(
                      carVsInvestResult.carB.totalCostOfOwnership -
                        carVsInvestResult.carA.totalCostOfOwnership,
                    )}{" "}
                    more in total ownership including depreciation, insurance,
                    and maintenance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="results-panel results-panel--empty">
                <Car size={32} strokeWidth={1.5} color="#d1d5db" />
                <p>
                  Set your two car prices and run the simulation to compare
                  total ownership costs.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Local vs Offshore */}
      <div className="simulation-card simulation-card--wide">
        <div className="simulation-hero simulation-hero--local-vs-offshore">
          <div className="simulation-hero-orb simulation-hero-orb--1" />
          <div className="simulation-hero-orb simulation-hero-orb--2" />
          <div className="simulation-hero-content">
            <div className="simulation-hero-icon">
              <Globe size={32} />
            </div>
            <h2>Local vs Offshore</h2>
            <p>
              Diversify your wealth across borders and currencies with
              confidence.
            </p>
            <ul className="simulation-hero-features">
              <li>Analyze JSE vs global market returns</li>
              <li>Explore diversification benefits</li>
              <li>Model currency exposure impact</li>
            </ul>
          </div>
        </div>

        <div className="simulation-body">
          <div className="simulation-inputs">
            <div className="input-group">
              <label>Monthly Contribution</label>
              <div className="input-wrapper">
                <span className="input-currency">R</span>
                <input
                  type="number"
                  className="simulation-input"
                  value={localVsOffshore.monthlyContribution}
                  onChange={(e) =>
                    handleLocalVsOffshoreChange(
                      "monthlyContribution",
                      Number(e.target.value),
                    )
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>
                Local Allocation — {localVsOffshore.localAllocation}% local /{" "}
                {100 - localVsOffshore.localAllocation}% offshore
              </label>
              <input
                type="range"
                className="range-input"
                min="0"
                max="100"
                step="10"
                value={localVsOffshore.localAllocation}
                style={{
                  background: rangeBackground(
                    localVsOffshore.localAllocation,
                    0,
                    100,
                  ),
                }}
                onChange={(e) =>
                  handleLocalVsOffshoreChange(
                    "localAllocation",
                    Number(e.target.value),
                  )
                }
              />
              <div className="allocation-labels">
                <span>100% Offshore</span>
                <span>100% Local</span>
              </div>
            </div>

            <div className="input-group">
              <label>
                Local Return (JSE) — {localVsOffshore.localReturn}% p.a.
              </label>
              <input
                type="range"
                className="range-input"
                min="4"
                max="15"
                step="0.5"
                value={localVsOffshore.localReturn}
                style={{
                  background: rangeBackground(
                    localVsOffshore.localReturn,
                    4,
                    15,
                  ),
                }}
                onChange={(e) =>
                  handleLocalVsOffshoreChange(
                    "localReturn",
                    Number(e.target.value),
                  )
                }
              />
              <span className="input-hint">
                JSE All Share historical avg: ~8% p.a.
              </span>
            </div>

            <div className="input-group">
              <label>
                Offshore Return — {localVsOffshore.offshoreReturn}% p.a.
              </label>
              <input
                type="range"
                className="range-input"
                min="4"
                max="15"
                step="0.5"
                value={localVsOffshore.offshoreReturn}
                style={{
                  background: rangeBackground(
                    localVsOffshore.offshoreReturn,
                    4,
                    15,
                  ),
                }}
                onChange={(e) =>
                  handleLocalVsOffshoreChange(
                    "offshoreReturn",
                    Number(e.target.value),
                  )
                }
              />
              <span className="input-hint">
                MSCI World historical avg: ~10% p.a.
              </span>
            </div>

            <div className="input-group">
              <label>Time Horizon — {localVsOffshore.years} years</label>
              <input
                type="range"
                className="range-input"
                min="1"
                max="20"
                step="1"
                value={localVsOffshore.years}
                style={{
                  background: rangeBackground(localVsOffshore.years, 1, 20),
                }}
                onChange={(e) =>
                  handleLocalVsOffshoreChange("years", Number(e.target.value))
                }
              />
            </div>
          </div>

          {localVsOffshoreResult ? (
            <div className="results-panel">
              <p className="results-label">Results</p>

              <div
                className="risk-badge"
                style={{
                  background: localVsOffshoreResult.riskColor + "18",
                  color: localVsOffshoreResult.riskColor,
                  borderColor: localVsOffshoreResult.riskColor + "40",
                }}
              >
                Risk level: {localVsOffshoreResult.riskLevel}
              </div>

              <div className="chart-section">
                <p className="chart-label">Portfolio growth over time</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={localVsOffshoreResult.chartData}>
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) =>
                        v >= 1000000
                          ? `R${(v / 1000000).toFixed(1)}M`
                          : `R${(v / 1000).toFixed(0)}K`
                      }
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value)]}
                      contentStyle={{
                        fontSize: "12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="100% Local"
                      stroke="#6b7280"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Diversified"
                      stroke="#a90c2b"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="100% Offshore"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  <span>
                    <span
                      className="legend-dot"
                      style={{ background: "#6b7280" }}
                    />
                    100% Local
                  </span>
                  <span>
                    <span
                      className="legend-dot"
                      style={{ background: "#a90c2b" }}
                    />
                    Diversified
                  </span>
                  <span>
                    <span
                      className="legend-dot"
                      style={{ background: "#3b82f6" }}
                    />
                    100% Offshore
                  </span>
                </div>
              </div>

              <div className="pie-stat-row">
                <PieChart width={90} height={90}>
                  <Pie
                    data={[
                      {
                        name: "Local",
                        value: localVsOffshoreResult.localAllocation,
                      },
                      {
                        name: "Offshore",
                        value: localVsOffshoreResult.offshoreAllocation,
                      },
                    ]}
                    cx={40}
                    cy={40}
                    innerRadius={22}
                    outerRadius={40}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    <Cell fill="#a90c2b" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                </PieChart>
                <div className="pie-legend">
                  <div className="pie-legend-item">
                    <span
                      className="legend-dot"
                      style={{ background: "#a90c2b" }}
                    />
                    <span>Local {localVsOffshoreResult.localAllocation}%</span>
                  </div>
                  <div className="pie-legend-item">
                    <span
                      className="legend-dot"
                      style={{ background: "#3b82f6" }}
                    />
                    <span>
                      Offshore {localVsOffshoreResult.offshoreAllocation}%
                    </span>
                  </div>
                </div>
                <div className="pie-stat">
                  <span className="stat-label">Your diversified value</span>
                  <span className="stat-value positive">
                    {formatCurrency(localVsOffshoreResult.finalMixed)}
                  </span>
                </div>
              </div>

              <div className="strategy-row">
                <div className="stat-group">
                  <span className="stat-label">100% Local</span>
                  <span className="stat-value">
                    {formatCurrency(localVsOffshoreResult.finalLocal)}
                  </span>
                </div>
                <div className="stat-group">
                  <span className="stat-label">100% Offshore</span>
                  <span className="stat-value">
                    {formatCurrency(localVsOffshoreResult.finalOffshore)}
                  </span>
                </div>
              </div>

              <div className="stat-group">
                <span className="stat-label">Total contributed</span>
                <span className="stat-value">
                  {formatCurrency(localVsOffshoreResult.totalContributed)}
                </span>
              </div>

              <div className="verdict">
                <strong>Verdict</strong>
                <p>
                  A diversified portfolio offers more stable long-term growth.
                  Your {localVsOffshoreResult.localAllocation}/
                  {localVsOffshoreResult.offshoreAllocation} split is classified
                  as <strong>{localVsOffshoreResult.riskLevel}</strong> and
                  projects {formatCurrency(localVsOffshoreResult.finalMixed)}{" "}
                  after {localVsOffshore.years} years — vs{" "}
                  {formatCurrency(localVsOffshoreResult.finalLocal)} fully
                  local. SARS allows R1M offshore per year without tax
                  clearance.
                </p>
              </div>
            </div>
          ) : (
            <div className="results-panel results-panel--empty">
              <Globe size={32} strokeWidth={1.5} color="#d1d5db" />
              <p>
                Adjust the sliders and run the simulation to see your portfolio
                projections.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Educational Section */}
      <div className="education-section">
        <h3>Understanding These Scenarios</h3>
        <div className="education-grid">
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

      {/* Simulation History */}
      {simulationHistory && simulationHistory.length > 0 && (
        <div className="simulation-history">
          <div className="simulation-history-header">
            <Clock size={18} />
            <h3>Previous Simulations</h3>
            <span className="history-count">
              {Math.min(4, simulationHistory.length)}
            </span>
          </div>

          <div className="history-grid">
            {simulationHistory.slice(-4).reverse().map((sim) => {
              const Icon = SIM_ICONS[sim.type] ?? Clock;
              const stats = formatHistoryResults(sim.type, sim.results);

              return (
                <div
                  key={sim.id}
                  className="history-card"
                  onClick={() => loadSimulationFromHistory(sim)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      loadSimulationFromHistory(sim);
                    }
                  }}
                >
                  <div className="history-card-header">
                    <div className="history-icon">
                      <Icon size={16} />
                    </div>
                    <div className="history-meta">
                      <span className="history-type">
                        {SIM_LABELS[sim.type] ?? sim.type}
                      </span>
                      <span className="history-date">
                        {new Date(sim.createdAt).toLocaleDateString("en-ZA", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="history-stats">
                    {stats.map(({ label, value }) => (
                      <div key={label} className="history-stat">
                        <span className="history-stat-label">{label}</span>
                        <span className="history-stat-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default SimulationLab;
