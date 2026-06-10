import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";

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
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    age: 36,
    monthlyIncome: 28250,
    monthlyExpenses: 20000,
    monthlySavings: 3000,
    savingsBalance: 140000, // enough to trigger milestone
    investmentBalance: 100000,
    retirementBalance: 200000,
    emergencyFundMonths: 2, // warning
    creditScore: 650, // warning
    creditCardDebt: 50000,
    personalLoanDebt: 20000,
    carLoanDebt: 15000,
    studentLoanDebt: 30000,
    propertyValue: 0,
    homeLoanDebt: 0,
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

  const [lastActiveTrack, setLastActiveTrack] = useState(
    localStorage.getItem("absa_last_active_track") || null,
  );

  const [simulationHistory, setSimulationHistory] = useState([
    {
      id: 1,
      type: "rent-vs-buy",
      createdAt: new Date().toISOString(),
      results: { breakEvenYear: 5 },
    },
    {
      id: 2,
      type: "car-vs-invest",
      createdAt: new Date().toISOString(),
      results: { monthlySaving: 1500, investmentValue: 90000 },
    },
  ]);
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

  // ─── Calculations (pure — no side effects) ───────────────
  const calculateNetWorth = () => {
    const totalAssets =
      userProfile.savingsBalance +
      userProfile.investmentBalance +
      userProfile.retirementBalance +
      (userProfile.propertyValue || 0);
    const totalLiabilities =
      (userProfile.creditCardDebt || 0) +
      (userProfile.personalLoanDebt || 0) +
      (userProfile.carLoanDebt || 0) +
      (userProfile.studentLoanDebt || 0) +
      (userProfile.homeLoanDebt || 0);
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

  // ─── Actions ─────────────────────────────────────────────
  const updateProfile = (updates) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  const updateTrackProgress = (trackId, milestoneIndex, status) => {
    setLastActiveTrack(trackId);
    localStorage.setItem("absa_last_active_track", trackId);
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
        [simulationId]: { ...result, timestamp: Date.now() },
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
        [simulationId]: [...existing, { ...result, timestamp: Date.now() }],
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

  const deleteSimulation = (simulationId) => {
    setSimulationHistory((prev) => {
      const updated = prev.filter((sim) => sim.id !== simulationId);
      localStorage.setItem("absa_simulation_history", JSON.stringify(updated));
      return updated;
    });
  };

  // ─── Persist to localStorage ─────────────────────────────
  // FIX: takeSnapshot is NOT called here — calling it inside the effect
  // that watches userProfile caused an infinite loop because takeSnapshot
  // itself called setSnapshots, which triggered re-renders, which re-ran
  // the effect. Snapshots are now taken explicitly via the takeSnapshot()
  // function, or you can add a separate debounced effect if you want
  // automatic snapshotting.
  useEffect(() => {
    try {
      localStorage.setItem("absa_user_profile", JSON.stringify(userProfile));
      localStorage.setItem(
        "absa_track_progress",
        JSON.stringify(trackProgress),
      );
      localStorage.setItem("absa_transactions", JSON.stringify(transactions));
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  }, [userProfile, trackProgress, transactions]);

  // ─── Snapshot on mount only (not on every change) ────────
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      takeSnapshot();
    }
  }, []);

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
    lastActiveTrack,
    deleteSimulation,
    saveSimulation,
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
