import {
  Home,
  Scale,
  Globe,
  BarChart3,
  ShieldCheck,
  LineChart,
  BadgeDollarSign,
  RefreshCw,
  PiggyBank,
  Wallet,
  CreditCard,
  KeyRound,
} from "lucide-react";

export const STRATEGIES = [
  {
    id: "first-property",
    title: "First Property Path",
    description:
      "Specifically designed for young professionals who prioritize long-term stability and aim to purchase property within the next few years.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    icon: <Home size={22} />,
    featured: true,
    highlights: [
      { icon: <PiggyBank size={16} />, text: "Emergency fund foundation" },
      { icon: <Wallet size={16} />, text: "Deposit savings plan" },
      { icon: <CreditCard size={16} />, text: "Credit score optimisation" },
      { icon: <KeyRound size={16} />, text: "Bond application readiness" },
    ],
    priorities: [
      "Save consistently toward a property deposit",
      "Achieve stable income and affordability",
      "Reduce unnecessary expenses",
    ],
    avoidances: [
      "Spending recklessly on discretionary items",
      "Making large purchases on first income",
      "Taking on high-interest consumer debt",
    ],
    tradeoffs: [
      "Delayed luxury, travel and material purchases",
      "Limited spending flexibility in early years",
      "Gradual lifestyle increase — not immediate",
    ],
    milestones: [
      { id: "fp-m0", year: "Year 1", title: "Build Emergency Fund" },
      { id: "fp-m1", year: "Year 2-3", title: "Save for Deposit" },
      { id: "fp-m2", year: "Year 4", title: "Improve Credit Score" },
      { id: "fp-m3", year: "Year 5", title: "Buy Your First Home" },
    ],
  },
  {
    id: "balanced-lifestyle",
    title: "Balanced Lifestyle & Investing",
    description:
      "Strike the perfect balance between living well today and building lasting wealth for tomorrow.",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    icon: <Scale size={28} />,
    featured: false,
    highlights: [
      { icon: <Wallet size={16} />, text: "50/30/20 budgeting framework" },
      { icon: <RefreshCw size={16} />, text: "Automated investment setup" },
      { icon: <LineChart size={16} />, text: "Diversified portfolio building" },
      { icon: <BarChart3 size={16} />, text: "Annual review & rebalance" },
    ],
    priorities: [
      "Maintain consistent savings rate of 20%+",
      "Automate investments to remove friction",
      "Build a diversified, low-cost portfolio",
    ],
    avoidances: [
      "Lifestyle inflation beyond 30% of income",
      "Neglecting retirement contributions",
      "Holding too much cash without investing",
    ],
    tradeoffs: [
      "Less entertainment and dining spending",
      "Fewer luxury trips in early years",
      "Delayed high-end upgrades (car, tech)",
    ],
    milestones: [
      { id: "bl-m0", year: "Year 1", title: "50/30/20 Budget" },
      { id: "bl-m1", year: "Year 2", title: "Auto-invest Setup" },
      { id: "bl-m2", year: "Year 3", title: "Diversify Portfolio" },
      { id: "bl-m3", year: "Year 4-5", title: "Review & Rebalance" },
    ],
  },
  {
    id: "global-investor",
    title: "Global Investor",
    description:
      "Expand your wealth beyond South African borders with a structured offshore exposure strategy.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    icon: <Globe size={28} />,
    featured: false,
    highlights: [
      { icon: <ShieldCheck size={16} />, text: "TFSA maximisation strategy" },
      { icon: <LineChart size={16} />, text: "Local & global ETF exposure" },
      { icon: <BadgeDollarSign size={16} />, text: "Currency diversification" },
      { icon: <RefreshCw size={16} />, text: "Long-term rebalancing plan" },
    ],
    priorities: [
      "Maximise annual TFSA contributions first",
      "Build offshore exposure gradually",
      "Diversify across currencies and markets",
    ],
    avoidances: [
      "Overexposure to rand-denominated assets",
      "Speculative single-stock offshore bets",
      "Ignoring SARS reporting requirements",
    ],
    tradeoffs: [
      "Rand/dollar volatility can affect returns",
      "Requires a 7–10 year minimum horizon",
      "Less liquidity than local investments",
    ],
    milestones: [
      { id: "gi-m0", year: "Year 1", title: "Open TFSA" },
      { id: "gi-m1", year: "Year 2", title: "Invest in ETFs" },
      { id: "gi-m2", year: "Year 3", title: "International Exposure" },
      { id: "gi-m3", year: "Year 4-5", title: "Rebalance Portfolio" },
    ],
  },
];
