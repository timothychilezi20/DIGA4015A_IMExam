import { useMemo } from "react";
import { useUser } from "../contexts/UserContext";

/**
 * Generates prioritised nudges from live user context + simulation history.
 * Each nudge: { id, type, category, title, message, cta?, ctaLink? }
 * type:     "opportunity" | "educational" | "warning" | "milestone"
 * category: "savings" | "investment" | "property" | "debt" | "tax" | "health"
 */
export function useNudges() {
  const {
    userProfile,
    simulationHistory,
    calculateSavingsRate,
    calculateDebtToIncome,
    calculateFinancialHealthScore,
    financialGoals,
  } = useUser();

  const nudges = useMemo(() => {
    const results = [];
    const {
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsBalance,
      investmentBalance,
      retirementBalance,
      emergencyFundMonths,
      creditScore,
      creditCardDebt,
      personalLoanDebt,
      carLoanDebt,
      studentLoanDebt,
    } = userProfile;

    const savingsRate = calculateSavingsRate();
    const dti = calculateDebtToIncome();
    const healthScore = calculateFinancialHealthScore();
    const disposable = monthlyIncome - monthlyExpenses - monthlySavings;
    const totalDebt =
      creditCardDebt + personalLoanDebt + carLoanDebt + studentLoanDebt;
    const tfsaAllowance = 36000;
    const annualSavings = monthlySavings * 12;

    // ── OPPORTUNITY NUDGES ───────────────────────────────────────────────────

    // Spare disposable income that could be invested
    if (disposable >= 2000) {
      const roundedDown = Math.floor(disposable / 500) * 500;
      results.push({
        id: "opp-invest-spare",
        type: "opportunity",
        category: "investment",
        title: "You have room to invest more",
        message: `You can increase your investment contribution by ${fmt(roundedDown)} without affecting your monthly budget.`,
        cta: "Run a simulation",
        ctaLink: "/simulation-lab",
      });
    }

    // TFSA not maxed
    if (annualSavings < tfsaAllowance) {
      const gap = tfsaAllowance - annualSavings;
      results.push({
        id: "opp-tfsa",
        type: "opportunity",
        category: "tax",
        title: "Maximise your TFSA allowance",
        message: `You have ${fmt(gap)} of your R36 000 annual TFSA allowance unused. Contributions grow tax-free.`,
        cta: "Learn more",
        ctaLink: "/strategy-tracker",
      });
    }

    // Savings rate below 20% but income is sufficient
    if (savingsRate < 20 && monthlyIncome >= 30000) {
      const target = monthlyIncome * 0.2;
      const shortfall = Math.round(target - monthlySavings);
      results.push({
        id: "opp-savings-rate",
        type: "opportunity",
        category: "savings",
        title: "Boost your savings rate",
        message: `You're saving ${Math.round(savingsRate)}% of your income. Increasing by ${fmt(shortfall)}/month puts you at the recommended 20%.`,
        cta: "Update your budget",
        ctaLink: "/money-snapshot",
      });
    }

    // Property deposit within reach based on simulation history
    const propertySimulations = simulationHistory.filter(
      (s) => s.type === "rent-vs-buy",
    );
    if (propertySimulations.length > 0) {
      const latest = propertySimulations[0];
      if (latest.results?.breakEvenYear && latest.results.breakEvenYear <= 7) {
        results.push({
          id: "opp-property-sim",
          type: "opportunity",
          category: "property",
          title: "Your property simulation looks promising",
          message: `Based on your last simulation, buying becomes financially better after ${latest.results.breakEvenYear} year${latest.results.breakEvenYear !== 1 ? "s" : ""}. You could start preparing your deposit now.`,
          cta: "View simulation",
          ctaLink: "/simulation-lab",
        });
      }
    }

    // Car simulation: if they ran one, remind them of investment opportunity
    const carSimulations = simulationHistory.filter(
      (s) => s.type === "car-vs-invest",
    );
    if (carSimulations.length > 0) {
      const latest = carSimulations[0];
      if (latest.results?.monthlySaving > 1000) {
        results.push({
          id: "opp-car-saving",
          type: "opportunity",
          category: "investment",
          title: "Put your car saving to work",
          message: `Your simulation showed a ${fmt(latest.results.monthlySaving)}/month saving. Invested over 5 years, that could grow to ${fmt(latest.results.investmentValue)}.`,
          cta: "Re-run simulation",
          ctaLink: "/simulation-lab",
        });
      }
    }

    // ── WARNING NUDGES ───────────────────────────────────────────────────────

    // Emergency fund below 3 months
    if (emergencyFundMonths < 3) {
      results.push({
        id: "warn-emergency",
        type: "warning",
        category: "savings",
        title: "Your emergency fund needs attention",
        message: `You have ${emergencyFundMonths} month${emergencyFundMonths !== 1 ? "s" : ""} of expenses saved. Aim for at least 3 months before investing aggressively.`,
        cta: "Build your fund",
        ctaLink: "/money-snapshot",
      });
    }

    // High debt-to-income
    if (dti > 35) {
      results.push({
        id: "warn-dti",
        type: "warning",
        category: "debt",
        title: "Your debt load is high",
        message: `Your debt repayments use ${Math.round(dti)}% of your income. Reducing this below 30% will free up capital for investing and improve your bond eligibility.`,
        cta: "Review your snapshot",
        ctaLink: "/money-snapshot",
      });
    }

    // Credit score below 700 — affects bond prospects
    if (creditScore < 700) {
      results.push({
        id: "warn-credit",
        type: "warning",
        category: "property",
        title: "Your credit score could hold back a bond",
        message: `A score of ${creditScore} is below the 700 threshold most banks prefer. Paying down credit card debt and avoiding new credit can improve it.`,
        cta: "First Property Path",
        ctaLink: "/strategy-tracker",
      });
    }

    // ── EDUCATIONAL NUDGES ───────────────────────────────────────────────────

    // No simulation run yet
    if (simulationHistory.length === 0) {
      results.push({
        id: "edu-try-sim",
        type: "educational",
        category: "investment",
        title: "See your decisions play out",
        message:
          "The Simulation Lab lets you compare renting vs buying, car choices, and investment splits before you commit. Your first simulation takes under a minute.",
        cta: "Try it now",
        ctaLink: "/simulation-lab",
      });
    }

    // Explain TFSA if no offshore simulation run
    const offshoreSimulations = simulationHistory.filter(
      (s) => s.type === "local-vs-offshore",
    );
    if (offshoreSimulations.length === 0) {
      results.push({
        id: "edu-tfsa",
        type: "educational",
        category: "tax",
        title: "Learn how tax-free savings accounts can benefit you",
        message:
          "A TFSA lets you invest up to R36 000 per year with zero tax on growth, dividends, or withdrawals — one of the most powerful tools for South African investors.",
        cta: "Explore Global Investor track",
        ctaLink: "/strategy-tracker",
      });
    }

    // Low investment balance relative to age
    if (userProfile.age >= 30 && investmentBalance < monthlyIncome * 6) {
      results.push({
        id: "edu-invest-gap",
        type: "educational",
        category: "investment",
        title: "Starting early matters more than starting big",
        message:
          "Compound growth rewards time over amount. Even R500/month invested now at 10% grows to over R1M in 30 years. The best time to start is today.",
        cta: "Balanced Lifestyle track",
        ctaLink: "/strategy-tracker",
      });
    }

    // Retirement balance low for age
    if (
      userProfile.age >= 35 &&
      retirementBalance < monthlyIncome * 12 * (userProfile.age - 25)
    ) {
      results.push({
        id: "edu-retirement",
        type: "educational",
        category: "investment",
        title: "Your retirement savings may need a boost",
        message:
          "A general rule is to have 1× your annual salary saved by 30, 3× by 40. An RA contribution also reduces your taxable income — a double benefit.",
        cta: "Update your profile",
        ctaLink: "/money-snapshot",
      });
    }

    // ── MILESTONE NUDGES ─────────────────────────────────────────────────────

    // Property deposit milestone
    const depositTarget = monthlyIncome * 48 * 0.1;
    const depositProgress = Math.min(
      100,
      (savingsBalance / depositTarget) * 100,
    );
    if (depositProgress >= 80 && depositProgress < 100) {
      results.push({
        id: "milestone-deposit",
        type: "milestone",
        category: "property",
        title: "Almost there — deposit within reach",
        message: `You're ${Math.round(depositProgress)}% of the way to a 10% deposit on a property at your income level. Keep your current savings rate.`,
        cta: "View property path",
        ctaLink: "/strategy-tracker",
      });
    }

    // Emergency fund complete
    if (emergencyFundMonths >= 6) {
      results.push({
        id: "milestone-emergency",
        type: "milestone",
        category: "savings",
        title: "Emergency fund complete",
        message:
          "You have 6+ months of expenses covered. You're now in a position to invest more aggressively without financial risk.",
        cta: "Explore next steps",
        ctaLink: "/strategy-tracker",
      });
    }

    // Health score milestone
    if (healthScore >= 75) {
      results.push({
        id: "milestone-health",
        type: "milestone",
        category: "health",
        title: "Strong financial health",
        message: `Your financial health score is ${Math.round(healthScore)}%. You're in the top tier — now focus on growing your wealth rather than fixing gaps.`,
      });
    }

    // Sort: warnings first, then opportunities, then milestones, then educational
    const order = { warning: 0, opportunity: 1, milestone: 2, educational: 3 };
    results.sort((a, b) => order[a.type] - order[b.type]);

    return results;
  }, [userProfile, simulationHistory]);

  return nudges;
}

function fmt(amount) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}
