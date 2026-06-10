import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import { formatCurrency } from "../utils/formatters";
import "./SimulationLab.css";
import "../styles/main.css";

import {
  House,
  Car,
  Globe,
  Clock,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";

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

// Refs for scrolling to each simulation section
const SIM_IDS = {
  "rent-vs-buy": "sim-rent-vs-buy",
  "car-vs-invest": "sim-car-vs-invest",
  "local-vs-offshore": "sim-local-vs-offshore",
};

function SimulationLab() {
  const { userProfile, saveSimulation, deleteSimulation, simulationHistory } =
    useUser();

  // ── History UI state ───────────────────────────────────────────────────────
  const [historyMinimized, setHistoryMinimized] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // ── Simulation inputs ──────────────────────────────────────────────────────
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

  // ── Save feedback state ────────────────────────────────────────────────────
  const [savedFeedback, setSavedFeedback] = useState({
    "rent-vs-buy": false,
    "car-vs-invest": false,
    "local-vs-offshore": false,
  });

  // ── Auto-calculate on input changes ───────────────────────────────────────
  useEffect(() => {
    calculateRentVsBuy();
  }, [rentVsBuy]);
  useEffect(() => {
    calculateCarVsInvest();
  }, [carVsInvest]);
  useEffect(() => {
    calculateLocalVsOffshore();
  }, [localVsOffshore]);

  // ── Save handlers (user-triggered only) ───────────────────────────────────
  const handleSaveRentVsBuy = () => {
    if (!rentVsBuyResult) return;
    saveSimulation({
      type: "rent-vs-buy",
      inputs: rentVsBuy,
      results: {
        equity: rentVsBuyResult.equity,
        totalRent: rentVsBuyResult.totalRent,
        monthlyBond: rentVsBuyResult.monthlyBond,
        breakEvenYear: rentVsBuyResult.breakEvenYear,
        affordabilityRatio: rentVsBuyResult.affordabilityRatio,
      },
    });
    triggerSaveFeedback("rent-vs-buy");
  };

  const handleSaveCarVsInvest = () => {
    if (!carVsInvestResult) return;
    saveSimulation({
      type: "car-vs-invest",
      inputs: carVsInvest,
      results: {
        investmentValue: carVsInvestResult.investmentValue,
        netWorthDifference: carVsInvestResult.netWorthDifference,
        monthlySaving: carVsInvestResult.monthlySaving,
      },
    });
    triggerSaveFeedback("car-vs-invest");
  };

  const handleSaveLocalVsOffshore = () => {
    if (!localVsOffshoreResult) return;
    saveSimulation({
      type: "local-vs-offshore",
      inputs: localVsOffshore,
      results: {
        finalLocal: localVsOffshoreResult.finalLocal,
        finalOffshore: localVsOffshoreResult.finalOffshore,
        finalMixed: localVsOffshoreResult.finalMixed,
        bestStrategy: localVsOffshoreResult.bestStrategy,
      },
    });
    triggerSaveFeedback("local-vs-offshore");
  };

  const triggerSaveFeedback = (type) => {
    setSavedFeedback((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setSavedFeedback((prev) => ({ ...prev, [type]: false }));
    }, 2000);
  };

  // ── Re-run from history ────────────────────────────────────────────────────
  const loadSimulationFromHistory = (sim) => {
    if (sim.type === "rent-vs-buy" && sim.inputs) {
      setRentVsBuy(sim.inputs);
    } else if (sim.type === "car-vs-invest" && sim.inputs) {
      setCarVsInvest(sim.inputs);
    } else if (sim.type === "local-vs-offshore" && sim.inputs) {
      setLocalVsOffshore(sim.inputs);
    }
    setTimeout(() => {
      const el = document.getElementById(SIM_IDS[sim.type]);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // ── Calculation functions (unchanged logic, auto-called on input change) ───

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
      remainingBalance -= monthlyBond - interestPayment;
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
      return {
        year: `Yr ${yr}`,
        "Buying net position": Math.round(
          yrEquity - monthlyBond * yr * 12 - totalUpfrontCosts,
        ),
        "Renting net position": Math.round(-yrRent),
      };
    });

    setRentVsBuyResult({
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
    });
  };

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
        totalCostOfOwnership:
          totalFinanceCost + totalRunningCosts + totalDepreciation,
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

    const chartData = Array.from({ length: years + 1 }, (_, yr) => {
      const yrMonths = yr * 12;
      const yrInvestment =
        monthlySaving > 0
          ? monthlySaving *
            ((Math.pow(1 + monthlyRate, yrMonths) - 1) / monthlyRate)
          : 0;
      return {
        year: `Yr ${yr}`,
        "Car A total cost": Math.round(
          carA.monthlyPayment * yrMonths + carA.deposit,
        ),
        "Car B total cost": Math.round(
          carB.monthlyPayment * yrMonths + carB.deposit,
        ),
        "Investment growth": Math.round(yrInvestment),
      };
    });

    setCarVsInvestResult({
      carA,
      carB,
      monthlySaving,
      investmentValue,
      totalSaved: monthlySaving * numMonths,
      investmentGain: investmentValue - monthlySaving * numMonths,
      chartData,
      netWorthDifference:
        investmentValue + carB.totalCostOfOwnership - carA.totalCostOfOwnership,
      affordabilityA: (carA.monthlyPayment / monthlyIncome) * 100,
      affordabilityB: (carB.monthlyPayment / monthlyIncome) * 100,
    });
  };

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

    const chartData = Array.from({ length: years + 1 }, (_, yr) => ({
      year: `Yr ${yr}`,
      "100% Local": Math.round(
        growPortfolio(monthlyContribution, localReturn, yr),
      ),
      Diversified: Math.round(
        growPortfolio(monthlyLocal, localReturn, yr) +
          growPortfolio(monthlyOffshore, offshoreReturn, yr),
      ),
      "100% Offshore": Math.round(
        growPortfolio(monthlyContribution, offshoreReturn, yr),
      ),
    }));

    const finalLocal = growPortfolio(monthlyContribution, localReturn, years);
    const finalOffshore = growPortfolio(
      monthlyContribution,
      offshoreReturn,
      years,
    );
    const finalMixed =
      growPortfolio(monthlyLocal, localReturn, years) +
      growPortfolio(monthlyOffshore, offshoreReturn, years);

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

    setLocalVsOffshoreResult({
      chartData,
      finalLocal,
      finalOffshore,
      finalMixed,
      totalContributed: monthlyContribution * 12 * years,
      riskLevel,
      riskColor,
      localAllocation,
      offshoreAllocation,
      bestStrategy:
        finalMixed >= finalOffshore && finalMixed >= finalLocal
          ? "Diversified"
          : finalOffshore >= finalLocal
            ? "100% Offshore"
            : "100% Local",
    });
  };

  // ── Change handlers ────────────────────────────────────────────────────────
  const handleRentVsBuyChange = (field, value) =>
    setRentVsBuy((prev) => ({ ...prev, [field]: value }));
  const handleCarVsInvestChange = (field, value) =>
    setCarVsInvest((prev) => ({ ...prev, [field]: value }));
  const handleLocalVsOffshoreChange = (field, value) =>
    setLocalVsOffshore((prev) => ({ ...prev, [field]: value }));

  // ── History helpers ────────────────────────────────────────────────────────
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
          { label: "100% Local", value: formatCurrency(results.finalLocal) },
          { label: "Diversified", value: formatCurrency(results.finalMixed) },
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

  const visibleHistory = showAllHistory
    ? simulationHistory.slice().reverse()
    : simulationHistory.slice().reverse().slice(0, 4);

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
        {/* ── Rent vs Buy ─────────────────────────────────────────────────── */}
        <div
          id="sim-rent-vs-buy"
          className="simulation-card simulation-card--wide"
        >
          <div
            className="simulation-hero simulation-hero--rent-vs-buy"
            style={{
              backgroundImage: `url('/src/assets/RentHero.jpeg')`,
            }}
          >
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

                {/* Save button */}
                <button
                  className={`save-simulation-btn ${savedFeedback["rent-vs-buy"] ? "save-simulation-btn--saved" : ""}`}
                  onClick={handleSaveRentVsBuy}
                >
                  <Save size={15} />
                  {savedFeedback["rent-vs-buy"]
                    ? "Saved to history!"
                    : "Save simulation"}
                </button>
              </div>
            ) : (
              <div className="results-panel results-panel--empty">
                <House size={32} strokeWidth={1.5} color="#d1d5db" />
                <p>Adjust the inputs to see your property comparison.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Car vs Invest ────────────────────────────────────────────────── */}
        <div
          id="sim-car-vs-invest"
          className="simulation-card simulation-card--wide"
        >
          <div
            className="simulation-hero simulation-hero--car-vs-invest"
            style={{
              backgroundImage: `url('src/assets/CarVsInvest.jpeg')`,
            }}
          >
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
                  {[
                    {
                      label: `Car A: ${Math.round(carVsInvestResult.affordabilityA)}% of income`,
                      ratio: carVsInvestResult.affordabilityA,
                    },
                    {
                      label: `Car B: ${Math.round(carVsInvestResult.affordabilityB)}% of income`,
                      ratio: carVsInvestResult.affordabilityB,
                    },
                  ].map(({ label, ratio }) => (
                    <div
                      key={label}
                      className="risk-badge"
                      style={{
                        background:
                          ratio <= 20
                            ? "#10B98118"
                            : ratio <= 30
                              ? "#F59E0B18"
                              : "#EF444418",
                        color:
                          ratio <= 20
                            ? "#10B981"
                            : ratio <= 30
                              ? "#F59E0B"
                              : "#EF4444",
                        borderColor:
                          ratio <= 20
                            ? "#10B98140"
                            : ratio <= 30
                              ? "#F59E0B40"
                              : "#EF444440",
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="car-comparison-grid">
                  {[
                    {
                      label: `Car A — ${formatCurrency(carVsInvest.carPriceA)}`,
                      car: carVsInvestResult.carA,
                      extra: "",
                    },
                    {
                      label: `Car B — ${formatCurrency(carVsInvest.carPriceB)}`,
                      car: carVsInvestResult.carB,
                      extra: "car-col--b",
                    },
                  ].map(({ label, car, extra }) => (
                    <div key={label} className={`car-col ${extra}`}>
                      <p className="car-col-label">{label}</p>
                      <div className="breakdown-list">
                        <div className="breakdown-item">
                          <span>Monthly payment</span>
                          <span>{formatCurrency(car.monthlyPayment)}</span>
                        </div>
                        <div className="breakdown-item">
                          <span>Total interest</span>
                          <span>{formatCurrency(car.totalInterest)}</span>
                        </div>
                        <div className="breakdown-item">
                          <span>Insurance ({carVsInvest.years} yrs)</span>
                          <span>
                            {formatCurrency(
                              car.annualInsurance * carVsInvest.years,
                            )}
                          </span>
                        </div>
                        <div className="breakdown-item">
                          <span>Maintenance ({carVsInvest.years} yrs)</span>
                          <span>
                            {formatCurrency(
                              car.annualMaintenance * carVsInvest.years,
                            )}
                          </span>
                        </div>
                        <div className="breakdown-item">
                          <span>Depreciation</span>
                          <span>{formatCurrency(car.totalDepreciation)}</span>
                        </div>
                        <div className="breakdown-item breakdown-item--total">
                          <span>Total cost</span>
                          <span>
                            {formatCurrency(car.totalCostOfOwnership)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
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

                <button
                  className={`save-simulation-btn ${savedFeedback["car-vs-invest"] ? "save-simulation-btn--saved" : ""}`}
                  onClick={handleSaveCarVsInvest}
                >
                  <Save size={15} />
                  {savedFeedback["car-vs-invest"]
                    ? "Saved to history!"
                    : "Save simulation"}
                </button>
              </div>
            ) : (
              <div className="results-panel results-panel--empty">
                <Car size={32} strokeWidth={1.5} color="#d1d5db" />
                <p>Set your two car prices to compare total ownership costs.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Local vs Offshore ──────────────────────────────────────────────── */}
      <div
        id="sim-local-vs-offshore"
        className="simulation-card simulation-card--wide"
      >
        <div
          className="simulation-hero simulation-hero--local-vs-offshore"
          style={{
            backgroundImage: `url('src/assets/LocalvsOffshoreHero.jpeg')`,
          }}
        >
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

              <button
                className={`save-simulation-btn ${savedFeedback["local-vs-offshore"] ? "save-simulation-btn--saved" : ""}`}
                onClick={handleSaveLocalVsOffshore}
              >
                <Save size={15} />
                {savedFeedback["local-vs-offshore"]
                  ? "Saved to history!"
                  : "Save simulation"}
              </button>
            </div>
          ) : (
            <div className="results-panel results-panel--empty">
              <Globe size={32} strokeWidth={1.5} color="#d1d5db" />
              <p>Adjust the sliders to see your portfolio projections.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Educational Section ────────────────────────────────────────────── */}
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

      {/* ── Simulation History ─────────────────────────────────────────────── */}
      {simulationHistory && simulationHistory.length > 0 && (
        <div className="simulation-history">
          <div className="simulation-history-header">
            <div className="simulation-history-header-left">
              <Clock size={18} />
              <h3>Previous Simulations</h3>
              <span className="history-count">{simulationHistory.length}</span>
            </div>
            <button
              className="history-toggle-btn"
              onClick={() => setHistoryMinimized((v) => !v)}
              aria-label={
                historyMinimized ? "Expand history" : "Minimise history"
              }
            >
              {historyMinimized ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronUp size={16} />
              )}
              {historyMinimized ? "Show" : "Hide"}
            </button>
          </div>

          {!historyMinimized && (
            <>
              {/* Horizontally scrollable row */}
              <div className="history-scroll-row">
                {visibleHistory.map((sim) => {
                  const Icon = SIM_ICONS[sim.type] ?? Clock;
                  const stats = formatHistoryResults(sim.type, sim.results);
                  return (
                    <div key={sim.id} className="history-card">
                      <div className="history-card-header">
                        <div className="history-icon">
                          <Icon size={16} />
                        </div>
                        <div className="history-meta">
                          <span className="history-type">
                            {SIM_LABELS[sim.type] ?? sim.type}
                          </span>
                          <span className="history-date">
                            {new Date(sim.createdAt).toLocaleDateString(
                              "en-ZA",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        {/* Delete button */}
                        <button
                          className="history-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSimulation(sim.id);
                          }}
                          aria-label="Delete simulation"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="history-stats">
                        {stats.map(({ label, value }) => (
                          <div key={label} className="history-stat">
                            <span className="history-stat-label">{label}</span>
                            <span className="history-stat-value">{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Re-run button */}
                      <button
                        className="history-rerun-btn"
                        onClick={() => loadSimulationFromHistory(sim)}
                      >
                        <RotateCcw size={13} />
                        Re-run simulation
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Show more / show less */}
              {simulationHistory.length > 4 && (
                <button
                  className="history-show-more-btn"
                  onClick={() => setShowAllHistory((v) => !v)}
                >
                  {showAllHistory
                    ? `Show less`
                    : `Show ${simulationHistory.length - 4} more`}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SimulationLab;
