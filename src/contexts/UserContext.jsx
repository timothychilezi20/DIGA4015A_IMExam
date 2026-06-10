import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const loadSavedData = () => {
    try {
      const savedProfile = localStorage.getItem("absa_user_profile");
      const savedProgress = localStorage.getItem("absa_track_progress");
      const savedTransactions = localStorage.getItem("absa_transactions");
      return {
        profile: savedProfile ? JSON.parse(savedProfile) : null,
        progress: savedProgress ? JSON.parse(savedProgress) : {},
        transactions: savedTransactions ? JSON.parse(savedTransactions) : [],
      };
    } catch (error) {
      console.error("Error loading saved data:", error);
      return { profile: null, progress: {}, transactions: [] };
    }
  };

  const savedData = loadSavedData();

  const [userProfile, setUserProfile] = useState({
    firstName: savedData.profile?.firstName || "Thabo",
    lastName: savedData.profile?.lastName || "Nkosi",
    email: savedData.profile?.email || "thabo@example.com",
    age: savedData.profile?.age || 28,
    location: savedData.profile?.location || "Johannesburg",
    monthlyIncome: savedData.profile?.monthlyIncome || 45000,
    monthlyExpenses: savedData.profile?.monthlyExpenses || 28000,
    monthlySavings: savedData.profile?.monthlySavings || 9000,
    savingsBalance: savedData.profile?.savingsBalance || 25000,
    investmentBalance: savedData.profile?.investmentBalance || 50000,
    retirementBalance: savedData.profile?.retirementBalance || 75000,
    propertyValue: savedData.profile?.propertyValue || 0,
    creditCardDebt: savedData.profile?.creditCardDebt || 5000,
    personalLoanDebt: savedData.profile?.personalLoanDebt || 15000,
    carLoanDebt: savedData.profile?.carLoanDebt || 80000,
    studentLoanDebt: savedData.profile?.studentLoanDebt || 20000,
    homeLoanDebt: savedData.profile?.homeLoanDebt || 0,
    riskTolerance: savedData.profile?.riskTolerance || "moderate",
    investmentHorizon: savedData.profile?.investmentHorizon || 10,
    financialGoals: savedData.profile?.financialGoals || [
      "emergency-fund",
      "retirement",
      "property",
    ],
    creditScore: savedData.profile?.creditScore || 680,
    emergencyFundMonths: savedData.profile?.emergencyFundMonths || 2,
    notificationsEnabled: savedData.profile?.notificationsEnabled !== false,
    darkMode: savedData.profile?.darkMode || false,
    currency: savedData.profile?.currency || "ZAR",
    hasCompletedOnboarding: savedData.profile?.hasCompletedOnboarding || false,
    joinDate: savedData.profile?.joinDate || new Date().toISOString(),
  });

  const [trackProgress, setTrackProgress] = useState(savedData.progress || {});
  const [selectedTrack, setSelectedTrack] = useState(
    savedData.profile?.selectedTrack || null,
  );
  const [transactions, setTransactions] = useState(
    savedData.transactions || [],
  );
  const [snapshots, setSnapshots] = useState(() =>
    JSON.parse(localStorage.getItem("absa_snapshots") || "[]"),
  );
  const [simulationResults, setSimulationResults] = useState(() =>
    JSON.parse(localStorage.getItem("absa_simulation_results") || "{}"),
  );
  const [simulationHistory, setSimulationHistory] = useState(() =>
    JSON.parse(localStorage.getItem("absa_simulation_history") || "[]"),
  );
  const [financialGoals, setFinancialGoals] = useState(
    savedData.profile?.financialGoals || [
      {
        id: "emergency-fund",
        name: "Emergency Fund",
        target: (savedData.profile?.monthlyExpenses || 28000) * 3,
        current: savedData.profile?.savingsBalance || 25000,
        deadline: "2024-12-31",
        color: "#3B82F6",
      },
      {
        id: "retirement",
        name: "Retirement Fund",
        target: 1000000,
        current: savedData.profile?.retirementBalance || 75000,
        deadline: "2035-12-31",
        color: "#10B981",
      },
      {
        id: "property",
        name: "Property Deposit",
        target: 200000,
        current:
          (savedData.profile?.savingsBalance || 25000) +
          (savedData.profile?.investmentBalance || 50000),
        deadline: "2026-12-31",
        color: "#F59E0B",
      },
    ],
  );
  const [isLoading, setIsLoading] = useState(false);

  // Calculations
  const calculateNetWorth = () => {
    const totalAssets =
      userProfile.savingsBalance +
      userProfile.investmentBalance +
      userProfile.retirementBalance +
      userProfile.propertyValue;
    const totalLiabilities =
      userProfile.creditCardDebt +
      userProfile.personalLoanDebt +
      userProfile.carLoanDebt +
      userProfile.studentLoanDebt +
      userProfile.homeLoanDebt;
    return totalAssets - totalLiabilities;
  };

  const calculateSavingsRate = () => {
    if (userProfile.monthlyIncome === 0) return 0;
    return (userProfile.monthlySavings / userProfile.monthlyIncome) * 100;
  };

  const calculateDebtToIncome = () => {
    const totalMonthlyDebt =
      userProfile.creditCardDebt * 0.05 +
      userProfile.personalLoanDebt * 0.1 +
      userProfile.carLoanDebt * 0.02 +
      userProfile.studentLoanDebt * 0.01;
    if (userProfile.monthlyIncome === 0) return 0;
    return (totalMonthlyDebt / userProfile.monthlyIncome) * 100;
  };

  const calculateFinancialHealthScore = () => {
    let score = 0;
    const savingsRate = calculateSavingsRate();
    if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 15) score += 25;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 5) score += 10;
    else score += 5;

    const emergencyFundRatio = userProfile.emergencyFundMonths / 6;
    score += Math.min(25, emergencyFundRatio * 25);

    const dti = calculateDebtToIncome();
    if (dti < 20) score += 25;
    else if (dti < 30) score += 20;
    else if (dti < 40) score += 15;
    else if (dti < 50) score += 10;
    else score += 5;

    if (userProfile.creditScore >= 750) score += 20;
    else if (userProfile.creditScore >= 700) score += 15;
    else if (userProfile.creditScore >= 650) score += 10;
    else if (userProfile.creditScore >= 600) score += 5;

    return Math.min(100, Math.max(0, score));
  };

  const getFinancialHealthRating = () => {
    const score = calculateFinancialHealthScore();
    if (score >= 80)
      return { label: "Excellent", color: "#10B981", icon: "🌟" };
    if (score >= 60) return { label: "Good", color: "#3B82F6", icon: "👍" };
    if (score >= 40) return { label: "Fair", color: "#F59E0B", icon: "⚠️" };
    if (score >= 20)
      return { label: "Needs Improvement", color: "#EF4444", icon: "🔴" };
    return { label: "Critical", color: "#991B1B", icon: "🚨" };
  };

  // Actions
  const updateProfile = (updates) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  const updateTrackProgress = (trackId, milestoneIndex, status) => {
    setTrackProgress((prev) => ({
      ...prev,
      [trackId]: { ...prev[trackId], [milestoneIndex]: status },
    }));
  };

  const getTrackProgress = (trackId) => {
    return trackProgress[trackId] || {};
  };

  const addTransaction = (transaction) => {
    const newTransaction = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...transaction,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    if (transaction.type === "income") {
      updateProfile({
        monthlyIncome: userProfile.monthlyIncome + transaction.amount,
      });
    } else if (transaction.type === "expense") {
      updateProfile({
        monthlyExpenses: userProfile.monthlyExpenses + transaction.amount,
      });
      updateProfile({
        monthlySavings: userProfile.monthlySavings - transaction.amount,
      });
    } else if (transaction.type === "savings") {
      updateProfile({
        savingsBalance: userProfile.savingsBalance + transaction.amount,
        monthlySavings: userProfile.monthlySavings + transaction.amount,
      });
    }
  };

  const updateGoalProgress = (goalId, amount) => {
    setFinancialGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId ? { ...goal, current: goal.current + amount } : goal,
      ),
    );
  };

  const saveSimulationResult = (simulationId, result) => {
    setSimulationResults((prev) => {
      const updated = {
        ...prev,
        [simulationId]: {
          ...result,
          timestamp: Date.now(),
        },
      };

      localStorage.setItem("absa_simulation_results", JSON.stringify(updated));

      return updated;
    });
  };

  const saveSimulation = (simulation) => {
    const newSimulation = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...simulation,
    };

    setSimulationHistory((prev) => {
      const updated = [newSimulation, ...prev];

      localStorage.setItem("absa_simulation_history", JSON.stringify(updated));

      return updated;
    });
  };

  const saveSimulationHistory = (simulationId, result) => {
    setSimulationResults((prev) => {
      const existing = prev[simulationId] || [];

      const updated = {
        ...prev,
        [simulationId]: [
          ...existing,
          {
            ...result,
            timestamp: Date.now(),
          },
        ],
      };

      localStorage.setItem("absa_simulation_results", JSON.stringify(updated));

      return updated;
    });
  };

  const takeSnapshot = () => {
    const snapshot = {
      date: new Date().toISOString(),
      savings: userProfile.savingsBalance,
      expenses: userProfile.monthlyExpenses,
      health: calculateFinancialHealthScore(),
      netWorth: calculateNetWorth(),
    };
    setSnapshots((prev) => {
      const updated = [...prev.slice(-11), snapshot];
      localStorage.setItem("absa_snapshots", JSON.stringify(updated));
      return updated;
    });
  };

  const resetAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all your data? This cannot be undone.",
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("absa_user_profile", JSON.stringify(userProfile));
      localStorage.setItem(
        "absa_track_progress",
        JSON.stringify(trackProgress),
      );
      localStorage.setItem("absa_transactions", JSON.stringify(transactions));
      takeSnapshot();
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  }, [userProfile, trackProgress, transactions]);

  const value = {
    userProfile,
    trackProgress,
    selectedTrack,
    transactions,
    financialGoals,
    isLoading,
    snapshots,
    simulationResults,
    simulationHistory,
    setUserProfile,
    updateProfile,
    setSelectedTrack,
    addTransaction,
    updateGoalProgress,
    updateTrackProgress,
    getTrackProgress,
    calculateNetWorth,
    calculateSavingsRate,
    calculateDebtToIncome,
    calculateFinancialHealthScore,
    getFinancialHealthRating,
    resetAllData,
    setIsLoading,
    takeSnapshot,
    saveSimulationResult,
    saveSimulationHistory,
    saveSimulation,
    netWorth: calculateNetWorth(),
    savingsRate: calculateSavingsRate(),
    debtToIncome: calculateDebtToIncome(),
    healthScore: calculateFinancialHealthScore(),
    healthRating: getFinancialHealthRating(),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const withUser = (WrappedComponent) => {
  return function WithUserComponent(props) {
    return (
      <UserContext.Consumer>
        {(context) => <WrappedComponent {...props} userContext={context} />}
      </UserContext.Consumer>
    );
  };
};

export default UserContext;
