export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`;
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat("en-ZA").format(value);
};
