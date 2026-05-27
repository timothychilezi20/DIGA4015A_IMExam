import React, { createContext, useState, useContext, useEffect } from "react";

// Create Context
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

// User Provider Component
export const UserProvider = ({ children }) => {
  // Load saved data from localStorage on initial load
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

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    // Personal Info
    firstName: savedData.profile?.firstName || "Thabo",
    lastName: savedData.profile?.lastName || "Nkosi",
    email: savedData.profile?.email || "thabo@example.com",
    age: savedData.profile?.age || 28,
    location: savedData.profile?.location || "Johannesburg",

    // Financial Profile
    monthlyIncome: savedData.profile?.monthlyIncome || 45000,
    monthlyExpenses: savedData.profile?.monthlyExpenses || 28000,
    monthlySavings: savedData.profile?.monthlySavings || 9000,

    // Assets
    savingsBalance: savedData.profile?.savingsBalance || 25000,
    investmentBalance: savedData.profile?.investmentBalance || 50000,
    retirementBalance: savedData.profile?.retirementBalance || 75000,
    propertyValue: savedData.profile?.propertyValue || 0,

    // Liabilities
    creditCardDebt: savedData.profile?.creditCardDebt || 5000,
    personalLoanDebt: savedData.profile?.personalLoanDebt || 15000,
    carLoanDebt: savedData.profile?.carLoanDebt || 80000,
    studentLoanDebt: savedData.profile?.studentLoanDebt || 20000,
    homeLoanDebt: savedData.profile?.homeLoanDebt || 0,

    // Investment Preferences
    riskTolerance: savedData.profile?.riskTolerance || "moderate", // conservative, moderate, aggressive
    investmentHorizon: savedData.profile?.investmentHorizon || 10, // years
    financialGoals: savedData.profile?.financialGoals || [
      "emergency-fund",
      "retirement",
      "property",
    ],

    // Financial Health Metrics
    creditScore: savedData.profile?.creditScore || 680,
    emergencyFundMonths: savedData.profile?.emergencyFundMonths || 2,

    // Settings
    notificationsEnabled: savedData.profile?.notificationsEnabled !== false,
    darkMode: savedData.profile?.darkMode || false,
    currency: savedData.profile?.currency || "ZAR",

    // Onboarding Status
    hasCompletedOnboarding: savedData.profile?.hasCompletedOnboarding || false,
    joinDate: savedData.profile?.joinDate || new Date().toISOString(),
  });

  // Strategy Track Progress
  const [trackProgress, setTrackProgress] = useState(savedData.progress || {});

  // Selected Track
  const [selectedTrack, setSelectedTrack] = useState(
    savedData.profile?.selectedTrack || null,
  );

  // Transaction History
  const [transactions, setTransactions] = useState(
    savedData.transactions || [],
  );

  // Financial Goals
  const [financialGoals, setFinancialGoals] = useState(
    savedData.profile?.financialGoals || [
      {
        id: "emergency-fund",
        name: "Emergency Fund",
        target: userProfile.monthlyExpenses * 3,
        current: userProfile.savingsBalance,
        deadline: "2024-12-31",
        color: "#3B82F6",
      },
      {
        id: "retirement",
        name: "Retirement Fund",
        target: 1000000,
        current: userProfile.retirementBalance,
        deadline: "2035-12-31",
        color: "#10B981",
      },
      {
        id: "property",
        name: "Property Deposit",
        target: 200000,
        current: userProfile.savingsBalance + userProfile.investmentBalance,
        deadline: "2026-12-31",
        color: "#F59E0B",
      },
    ],
  );

  // Loading State
  const [isLoading, setIsLoading] = useState(false);

  // Save data to localStorage whenever it changes
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

  // Calculate Net Worth
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

  // Calculate Savings Rate
  const calculateSavingsRate = () => {
    if (userProfile.monthlyIncome === 0) return 0;
    return (userProfile.monthlySavings / userProfile.monthlyIncome) * 100;
  };

  // Calculate Debt-to-Income Ratio
  const calculateDebtToIncome = () => {
    const totalMonthlyDebt =
      userProfile.creditCardDebt * 0.05 + // Assume 5% minimum payment
      userProfile.personalLoanDebt * 0.1 +
      userProfile.carLoanDebt * 0.02 +
      userProfile.studentLoanDebt * 0.01;

    if (userProfile.monthlyIncome === 0) return 0;
    return (totalMonthlyDebt / userProfile.monthlyIncome) * 100;
  };

  // Update Profile Function
  const updateProfile = (updates) => {
    setUserProfile((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Update Track Progress
  const updateTrackProgress = (trackId, milestoneIndex, status) => {
    setTrackProgress((prev) => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        [milestoneIndex]: status,
      },
    }));
  };

  // Get Track Progress
  const getTrackProgress = (trackId) => {
    return trackProgress[trackId] || {};
  };

  // Add Transaction
  const addTransaction = (transaction) => {
    const newTransaction = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...transaction,
    };
    setTransactions((prev) => [newTransaction, ...prev]);

    // Update balances based on transaction type
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

  // Update Financial Goal Progress
  const updateGoalProgress = (goalId, amount) => {
    setFinancialGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId ? { ...goal, current: goal.current + amount } : goal,
      ),
    );
  };

  // Calculate Financial Health Score (0-100)
  const calculateFinancialHealthScore = () => {
    let score = 0;

    // Savings Rate (max 30 points)
    const savingsRate = calculateSavingsRate();
    if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 15) score += 25;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 5) score += 10;
    else score += 5;

    // Emergency Fund (max 25 points)
    const emergencyFundRatio = userProfile.emergencyFundMonths / 6;
    score += Math.min(25, emergencyFundRatio * 25);

    // Debt-to-Income (max 25 points)
    const dti = calculateDebtToIncome();
    if (dti < 20) score += 25;
    else if (dti < 30) score += 20;
    else if (dti < 40) score += 15;
    else if (dti < 50) score += 10;
    else score += 5;

    // Credit Score (max 20 points)
    if (userProfile.creditScore >= 750) score += 20;
    else if (userProfile.creditScore >= 700) score += 15;
    else if (userProfile.creditScore >= 650) score += 10;
    else if (userProfile.creditScore >= 600) score += 5;
    else score += 0;

    return Math.min(100, Math.max(0, score));
  };

  // Get Financial Health Rating
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

  // Reset All Data
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

  // Context Value
  const value = {
    // State
    userProfile,
    trackProgress,
    selectedTrack,
    transactions,
    financialGoals,
    isLoading,

    // Setters
    setUserProfile,
    updateProfile,
    setSelectedTrack,
    addTransaction,
    updateGoalProgress,

    // Track Progress Methods
    updateTrackProgress,
    getTrackProgress,

    // Calculations
    calculateNetWorth,
    calculateSavingsRate,
    calculateDebtToIncome,
    calculateFinancialHealthScore,
    getFinancialHealthRating,

    // Helper Methods
    resetAllData,
    setIsLoading,

    // Financial Metrics
    netWorth: calculateNetWorth(),
    savingsRate: calculateSavingsRate(),
    debtToIncome: calculateDebtToIncome(),
    healthScore: calculateFinancialHealthScore(),
    healthRating: getFinancialHealthRating(),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Higher-order component to wrap components that need user context
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
