import { useState } from "react";
import "./LearnSection.css";

function LearnSection() {
  const [activeCategory, setActiveCategory] = useState("basics");
  const [expandedArticle, setExpandedArticle] = useState(null);

  const categories = {
    basics: {
      name: "Financial Basics",
      icon: "📚",
      articles: [
        {
          id: "net-worth",
          title: "What is Net Worth?",
          icon: "💰",
          readTime: "3 min",
          content: `
            <p>Your net worth is the total value of everything you own (assets) minus everything you owe (liabilities). It's the most accurate picture of your financial health.</p>
            
            <h4>Assets include:</h4>
            <ul>
              <li>Cash in bank accounts</li>
              <li>Investments (RAs, TFSA, ETFs)</li>
              <li>Property value</li>
              <li>Car value</li>
              <li>Retirement savings</li>
            </ul>
            
            <h4>Liabilities include:</h4>
            <ul>
              <li>Home loan balance</li>
              <li>Car loan balance</li>
              <li>Credit card debt</li>
              <li>Student loans</li>
              <li>Personal loans</li>
            </ul>
            
            <p><strong>South African context:</strong> Your net worth determines your ability to qualify for home loans and other credit. Banks typically want to see a positive net worth growth trend.</p>
          `,
        },
        {
          id: "emergency-fund",
          title: "The Emergency Fund",
          icon: "🛡️",
          readTime: "4 min",
          content: `
            <p>An emergency fund is 3-6 months of living expenses saved in an easily accessible account for unexpected events like job loss, medical emergencies, or urgent home repairs.</p>
            
            <h4>How much do you need?</h4>
            <p>Calculate your monthly essential expenses (rent, food, utilities, transport, insurance) and multiply by 3-6.</p>
            
            <h4>Where to keep it?</h4>
            <ul>
              <li>High-interest savings account (e.g., ABSA Money Market)</li>
              <li>Notice deposit account</li>
              <li>Tax-free savings account (for part of it)</li>
            </ul>
            
            <p><strong>South African context:</strong> With the current economic uncertainty and high unemployment rate, having 6 months of expenses is recommended for South Africans.</p>
          `,
        },
        {
          id: "budgeting",
          title: "The 50/30/20 Rule",
          icon: "📊",
          readTime: "3 min",
          content: `
            <p>The 50/30/20 rule is a simple budgeting framework that helps you manage your money effectively.</p>
            
            <h4>The breakdown:</h4>
            <ul>
              <li><strong>50% Needs:</strong> Essential expenses (rent, food, utilities, transport, insurance)</li>
              <li><strong>30% Wants:</strong> Discretionary spending (dining out, entertainment, shopping)</li>
              <li><strong>20% Savings:</strong> Financial goals (RA, TFSA, emergency fund, investments)</li>
            </ul>
            
            <p><strong>South African adaptation:</strong> Given higher transport and electricity costs, you might need to adjust these percentages. Start with 60/20/20 if needed.</p>
          `,
        },
      ],
    },
    investments: {
      name: "Investing in SA",
      icon: "📈",
      articles: [
        {
          id: "ra-explained",
          title: "Retirement Annuities (RA)",
          icon: "👴",
          readTime: "5 min",
          content: `
            <p>A Retirement Annuity (RA) is a long-term investment vehicle designed specifically for retirement savings in South Africa.</p>
            
            <h4>Key benefits:</h4>
            <ul>
              <li><strong>Tax-deductible:</strong> Contributions are deductible up to 27.5% of your taxable income (capped at R350,000 per year)</li>
              <li><strong>Tax-free growth:</strong> All investment growth within the RA is tax-free</li>
              <li><strong>Creditor protection:</strong> Your RA cannot be claimed by creditors if you go bankrupt</li>
            </ul>
            
            <h4>Considerations:</h4>
            <ul>
              <li>You can only access funds from age 55</li>
              <li>At least 2/3 must be used to buy an annuity</li>
              <li>Early withdrawal has severe tax penalties</li>
            </ul>
            
            <p><strong>Pro tip:</strong> Start your RA early - R1,000 per month from age 25 could grow to over R3 million by age 65 at 10% returns.</p>
          `,
        },
        {
          id: "tfsa-guide",
          title: "Tax-Free Savings Account (TFSA)",
          icon: "💰",
          readTime: "4 min",
          content: `
            <p>A Tax-Free Savings Account (TFSA) allows you to invest without paying tax on the growth or withdrawals.</p>
            
            <h4>Key facts:</h4>
            <ul>
              <li><strong>Annual limit:</strong> R36,000 per tax year</li>
              <li><strong>Lifetime limit:</strong> R500,000</li>
              <li><strong>No tax on:</strong> Interest, dividends, or capital gains</li>
              <li><strong>Withdraw anytime:</strong> No penalties (but withdrawn amounts count toward your lifetime limit)</li>
            </ul>
            
            <h4>What to invest in?</h4>
            <ul>
              <li>Low-cost global ETFs (e.g., Satrix MSCI World)</li>
              <li>Local equity ETFs (e.g., Satrix Top 40)</li>
              <li>Property REITs</li>
              <li>Balanced funds</li>
            </ul>
            
            <p><strong>Strategy:</strong> Max out your TFSA before investing in taxable accounts. The tax savings over 30 years can be massive.</p>
          `,
        },
        {
          id: "etf-investing",
          title: "ETF Investing for Beginners",
          icon: "📊",
          readTime: "4 min",
          content: `
            <p>Exchange-Traded Funds (ETFs) are baskets of stocks that trade on the JSE, offering instant diversification at low cost.</p>
            
            <h4>Popular South African ETFs:</h4>
            <ul>
              <li><strong>Satrix Top 40:</strong> Tracks JSE's top 40 companies</li>
              <li><strong>Satrix MSCI World:</strong> Global exposure to developed markets</li>
              <li><strong>Sygnia Itrix S&P 500:</strong> Tracks US S&P 500 index</li>
              <li><strong>Ashburton Global 1200:</strong> Balanced global equity</li>
            </ul>
            
            <h4>Why ETFs?</h4>
            <ul>
              <li>Low fees (0.2% - 0.5% vs 1-2% for active funds)</li>
              <li>Instant diversification</li>
              <li>Trade like shares on the JSE</li>
              <li>Perfect for TFSA and RA investments</li>
            </ul>
            
            <p><strong>Getting started:</strong> Open an account with EasyEquities, Sygnia, or your bank's investment platform.</p>
          `,
        },
      ],
    },
    property: {
      name: "Property & Home",
      icon: "🏠",
      articles: [
        {
          id: "buying-first-home",
          title: "Buying Your First Home",
          icon: "🏡",
          readTime: "6 min",
          content: `
            <p>Buying your first home is exciting but requires careful planning. Here's what South African first-time buyers need to know.</p>
            
            <h4>Costs to consider:</h4>
            <ul>
              <li><strong>Deposit:</strong> 10-20% of property price (can be 0% with some banks)</li>
              <li><strong>Transfer duty:</strong> 0% for properties under R1.1 million, sliding scale above</li>
              <li><strong>Bond registration:</strong> ~R30,000 - R50,000 (can be added to bond)</li>
              <li><strong>Transfer fees:</strong> ~1% of property value</li>
              <li><strong>Home inspection:</strong> R3,000 - R5,000</li>
            </ul>
            
            <h4>How much can you afford?</h4>
            <p>Banks typically approve up to 30% of your gross monthly income for bond repayments. Use the 3x annual income rule: property price ≤ 3 × annual salary.</p>
            
            <h4>First-time buyer benefits:</h4>
            <ul>
              <li>No transfer duty on properties under R1.1 million</li>
              <li>FLISP subsidy for lower-income buyers (up to R87,000)</li>
              <li>Lower deposit requirements</li>
            </ul>
            
            <p><strong>Pro tip:</strong> Get pre-approved before house hunting - it shows sellers you're serious and helps you stick to your budget.</p>
          `,
        },
        {
          id: "rent-vs-buy",
          title: "Rent vs Buy Analysis",
          icon: "⚖️",
          readTime: "4 min",
          content: `
            <p>The rent vs buy decision depends on your personal situation, local market, and time horizon.</p>
            
            <h4>When renting makes sense:</h4>
            <ul>
              <li>You plan to move within 3-5 years</li>
              <li>You don't have a 10-20% deposit saved</li>
              <li>You prefer flexibility and lower responsibility</li>
              <li>Rent is significantly cheaper than a bond</li>
            </ul>
            
            <h4>When buying makes sense:</h4>
            <ul>
              <li>You plan to stay 5+ years</li>
              <li>You have a stable job and income</li>
              <li>You want to build equity and wealth</li>
              <li>Bond repayment is similar to or less than rent</li>
            </ul>
            
            <h4>Hidden costs of buying:</h4>
            <ul>
              <li>Rates and taxes (R500-2000/month)</li>
              <li>Levies (R1000-5000/month for complexes)</li>
              <li>Maintenance (1-2% of property value annually)</li>
              <li>Home insurance (R500-1000/month)</li>
            </ul>
            
            <p><strong>South African context:</strong> With interest rates at 11.75% prime, buying is expensive now. Run the numbers carefully before committing.</p>
          `,
        },
      ],
    },
    tax: {
      name: "Tax & SARS",
      icon: "📋",
      articles: [
        {
          id: "tax-brackets",
          title: "Understanding Tax Brackets",
          icon: "🧾",
          readTime: "3 min",
          content: `
            <p>South Africa uses a progressive tax system - the more you earn, the higher percentage you pay in tax.</p>
            
            <h4>2024 Tax Brackets (under 65):</h4>
            <ul>
              <li>R1 - R237,100: 18%</li>
              <li>R237,101 - R370,500: 26%</li>
              <li>R370,501 - R512,800: 31%</li>
              <li>R512,801 - R673,000: 36%</li>
              <li>R673,001 - R857,900: 39%</li>
              <li>R857,901 - R1,817,000: 41%</li>
              <li>R1,817,001+: 45%</li>
            </ul>
            
            <h4>Tax rebates (2024):</h4>
            <ul>
              <li>Primary: R17,235</li>
              <li>Secondary (65+): R9,444</li>
              <li>Tertiary (75+): R3,145</li>
            </ul>
            
            <h4>Ways to reduce tax:</h4>
            <ul>
              <li>Maximise RA contributions (27.5% deduction)</li>
              <li>Medical aid contributions (tax credits)</li>
              <li>Donations to registered charities (up to 10% of taxable income)</li>
              <li>Travel allowance claims (if applicable)</li>
            </ul>
          `,
        },
        {
          id: "retirement-tax",
          title: "Retirement Tax Benefits",
          icon: "🏦",
          readTime: "3 min",
          content: `
            <p>South Africa offers significant tax incentives to encourage retirement savings.</p>
            
            <h4>RA tax benefits:</h4>
            <ul>
              <li><strong>Contributions:</strong> Tax-deductible up to 27.5% of the higher of your remuneration or taxable income (capped at R350,000)</li>
              <li><strong>Growth:</strong> All investment returns within the RA are tax-free</li>
              <li><strong>Withdrawal:</strong> First R500,000 tax-free at retirement, remainder taxed at reduced rates</li>
            </ul>
            
            <h4>Example savings:</h4>
            <p>If you earn R500,000 and contribute R100,000 to an RA, your taxable income drops to R400,000, saving you approximately R36,000 in tax!</p>
            
            <h4>Company pension vs RA:</h4>
            <p>Company pensions offer employer matching but less flexibility. RAs give you full control and portability between jobs.</p>
          `,
        },
      ],
    },
  };

  const activeArticles = categories[activeCategory].articles;

  const toggleArticle = (articleId) => {
    if (expandedArticle === articleId) {
      setExpandedArticle(null);
    } else {
      setExpandedArticle(articleId);
    }
  };

  return (
    <div className="learn-section">
      <div className="learn-header">
        <h2>📚 Financial Learning Center</h2>
        <p>
          Empower yourself with knowledge about South African personal finance
        </p>
      </div>

      <div className="learn-container">
        {/* Categories Sidebar */}
        <div className="categories-sidebar">
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              className={`category-btn ${activeCategory === key ? "active" : ""}`}
              onClick={() => setActiveCategory(key)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Articles Section */}
        <div className="articles-section">
          <div className="articles-header">
            <h3>{categories[activeCategory].name}</h3>
            <p>Click on any article to learn more</p>
          </div>

          <div className="articles-list">
            {activeArticles.map((article) => (
              <div
                key={article.id}
                className={`article-card ${expandedArticle === article.id ? "expanded" : ""}`}
              >
                <div
                  className="article-header"
                  onClick={() => toggleArticle(article.id)}
                >
                  <div className="article-icon">{article.icon}</div>
                  <div className="article-info">
                    <h4>{article.title}</h4>
                    <div className="article-meta">
                      <span className="read-time">
                        📖 {article.readTime} read
                      </span>
                    </div>
                  </div>
                  <div className="article-expand">
                    <span>{expandedArticle === article.id ? "−" : "+"}</span>
                  </div>
                </div>

                {expandedArticle === article.id && (
                  <div
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Quick Tips Section */}
          <div className="quick-tips">
            <h4>💡 Quick Financial Tips for South Africans</h4>
            <div className="tips-grid">
              <div className="tip">
                <span className="tip-icon">🏦</span>
                <p>Maximise your RA before March to claim tax deductions</p>
              </div>
              <div className="tip">
                <span className="tip-icon">💰</span>
                <p>Use your R36,000 TFSA annual limit before it resets</p>
              </div>
              <div className="tip">
                <span className="tip-icon">📊</span>
                <p>
                  Keep 3-6 months of expenses in a high-interest savings account
                </p>
              </div>
              <div className="tip">
                <span className="tip-icon">🏠</span>
                <p>
                  First-time buyers save on transfer duty under R1.1 million
                </p>
              </div>
            </div>
          </div>

          {/* Glossary Section */}
          <div className="glossary-section">
            <h4>📖 Financial Glossary</h4>
            <div className="glossary-grid">
              <div className="glossary-item">
                <strong>APR</strong>
                <p>
                  Annual Percentage Rate - the yearly cost of borrowing
                  including fees
                </p>
              </div>
              <div className="glossary-item">
                <strong>RA</strong>
                <p>
                  Retirement Annuity - tax-efficient retirement savings vehicle
                </p>
              </div>
              <div className="glossary-item">
                <strong>TFSA</strong>
                <p>
                  Tax-Free Savings Account - invest without paying tax on growth
                </p>
              </div>
              <div className="glossary-item">
                <strong>ETF</strong>
                <p>
                  Exchange-Traded Fund - basket of securities trading on the JSE
                </p>
              </div>
              <div className="glossary-item">
                <strong>SARS</strong>
                <p>South African Revenue Service - tax collection authority</p>
              </div>
              <div className="glossary-item">
                <strong>DTI</strong>
                <p>
                  Debt-to-Income ratio - monthly debt payments ÷ monthly income
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearnSection;
