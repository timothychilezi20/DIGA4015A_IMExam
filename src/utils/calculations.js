export const calculateMonthlyMortgage = (
  propertyPrice,
  depositPercent,
  interestRate,
  years,
) => {
  const deposit = propertyPrice * (depositPercent / 100);
  const loanAmount = propertyPrice - deposit;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = years * 12;

  if (monthlyRate === 0) return loanAmount / numberOfPayments;

  const payment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  return payment;
};

export const calculateInvestmentGrowth = (
  principal,
  monthlyContribution,
  annualReturnRate,
  years,
) => {
  const monthlyRate = annualReturn / 100 / 12;
  const months = years * 12;

  let futureValue = principal * Math.pow(1 + monthlyRate, months);

  if (monthlyContribution > 0) {
    futureValue +=
      (monthlyContribution * (Math.pow(1 + monthlyRate, months) - 1)) /
      monthlyRate;
  }
  return futureValue;
};
