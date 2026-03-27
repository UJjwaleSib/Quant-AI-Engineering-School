"""
Complete curriculum for the AIEngSchool platform.
Track 1: Quant Research Foundations (Q1-Q6)
Track 2: AI Engineering Systems (A1-A10)

Each lesson has:
  - title: str
  - duration_min: int
  - concept: str          (explanation)
  - why_it_matters: str   (quant/real-world angle)
  - code_example: str     (runnable Python)
  - exercises: list of {prompt, starter_code, hints}
"""

CURRICULUM = {
    "tracks": [
        {
            "name": "Track 1: Quant Research Foundations",
            "modules": [
                # ── Q1 ────────────────────────────────────────────────────────
                {
                    "slug": "Q1",
                    "title": "Python for Quant Research",
                    "description": "Master the numerical and data stack used by every quant desk: NumPy, Pandas, Matplotlib, and yfinance. Build intuition for financial time series from day one.",
                    "lessons": [
                        {
                            "title": "NumPy for Financial Computation",
                            "duration_min": 20,
                            "concept": "NumPy is the foundation of all numerical computing in Python. For quants, it provides vectorised operations on price arrays, log-return calculations, and fast matrix algebra for covariance matrices — all orders of magnitude faster than plain Python loops.",
                            "why_it_matters": "Every backtester, risk model, and portfolio optimiser ultimately boils down to array operations. Mastering NumPy means you can prototype a strategy in minutes and scale it to millions of data points without rewriting anything.",
                            "code_example": """import numpy as np

# Simulate 252 daily returns (one trading year)
np.random.seed(42)
daily_returns = np.random.normal(0.0005, 0.015, 252)

# Compound to get price series starting at 100
prices = 100 * np.cumprod(1 + daily_returns)

# Key statistics
print(f"Annualised return : {daily_returns.mean() * 252:.2%}")
print(f"Annualised vol    : {daily_returns.std() * np.sqrt(252):.2%}")
print(f"Sharpe ratio      : {(daily_returns.mean() / daily_returns.std()) * np.sqrt(252):.2f}")
print(f"Max price         : {prices.max():.2f}")
print(f"Min price         : {prices.min():.2f}")

# Log returns vs simple returns — critical distinction
log_returns = np.log(prices[1:] / prices[:-1])
print(f"\\nLog return mean   : {log_returns.mean():.6f}")
print(f"Simple return mean: {daily_returns[1:].mean():.6f}")""",
                            "exercises": [
                                {
                                    "prompt": "Create a NumPy array of 500 random daily returns with mean=0.0003 and std=0.012. Compute: (1) annualised Sharpe ratio, (2) maximum drawdown as a percentage, (3) percentage of positive days. Print all three.",
                                    "starter_code": "import numpy as np\nnp.random.seed(0)\n\n# Your code here\n",
                                    "hints": ["Use np.cumprod(1 + returns) to build price series", "Max drawdown = (peak - trough) / peak — use np.maximum.accumulate for rolling peak"]
                                },
                                {
                                    "prompt": "Given two assets with annual returns [0.12, 0.08] and a 2x2 covariance matrix [[0.04, 0.01],[0.01, 0.02]], compute portfolio variance for weights [0.6, 0.4] using NumPy matrix operations (w.T @ cov @ w).",
                                    "starter_code": "import numpy as np\n\nreturns = np.array([0.12, 0.08])\ncov = np.array([[0.04, 0.01], [0.01, 0.02]])\nweights = np.array([0.60, 0.40])\n\n# Your code here\n",
                                    "hints": ["Portfolio variance = w.T @ cov @ w", "Portfolio return = w @ returns"]
                                }
                            ]
                        },
                        {
                            "title": "Pandas for Market Data Analysis",
                            "duration_min": 25,
                            "concept": "Pandas DataFrames are the lingua franca of financial data. They provide time-indexed price series, rolling statistics, groupby operations, and seamless CSV/API ingestion. Understanding resampling, shifting, and `.pct_change()` is non-negotiable for any quant role.",
                            "why_it_matters": "Real market data is messy: missing values, corporate actions, timezone issues. Pandas gives you the tooling to clean, align, and analyse multi-asset datasets that would be impossible to handle with spreadsheets.",
                            "code_example": """import pandas as pd
import numpy as np

# Build a synthetic OHLCV DataFrame
np.random.seed(42)
dates = pd.date_range("2023-01-01", periods=252, freq="B")
close = 100 * (1 + pd.Series(np.random.normal(0.0005, 0.015, 252))).cumprod()

df = pd.DataFrame({
    "close": close.values,
    "volume": np.random.randint(1_000_000, 5_000_000, 252),
}, index=dates)

# Daily returns
df["returns"] = df["close"].pct_change()

# Rolling statistics — 20-day window
df["ma20"]  = df["close"].rolling(20).mean()
df["vol20"] = df["returns"].rolling(20).std() * np.sqrt(252)

# Monthly resampling
monthly = df["returns"].resample("ME").apply(lambda x: (1+x).prod() - 1)
print("Monthly returns:")
print(monthly.head())

# Momentum signal: 12-1 month (common factor)
df["mom"] = df["close"].pct_change(252) - df["close"].pct_change(21)
print(f"\\nCorr(momentum, next-month return): {df['mom'].shift(1).corr(df['returns'].shift(-21)):.3f}")""",
                            "exercises": [
                                {
                                    "prompt": "Create a Pandas DataFrame with 2 years of daily data for two fictional stocks A and B. Stock A: mean return 0.0006, vol 0.014. Stock B: mean return 0.0003, vol 0.010. Compute: rolling 60-day correlation between A and B, and print the 5 dates where correlation was lowest (most diversification benefit).",
                                    "starter_code": "import pandas as pd\nimport numpy as np\n\nnp.random.seed(1)\ndates = pd.date_range('2022-01-01', periods=504, freq='B')\n\n# Build price series here\n",
                                    "hints": ["Use pd.DataFrame({'A': ..., 'B': ...})", "rolling_corr = df['A'].rolling(60).corr(df['B'])"]
                                },
                                {
                                    "prompt": "Build a simple momentum signal: for a price series, compute the 20-day return minus the 5-day return. Then compute the forward 5-day return. Calculate the Pearson correlation between signal and forward return, and print the hit rate (% of times signal direction matches forward return direction).",
                                    "starter_code": "import pandas as pd\nimport numpy as np\n\nnp.random.seed(7)\nprices = 100 * (1 + pd.Series(np.random.normal(0.0004, 0.012, 500))).cumprod()\n\n# Your code here\n",
                                    "hints": ["Signal = prices.pct_change(20) - prices.pct_change(5)", "Hit rate = (np.sign(signal) == np.sign(forward_return)).mean()"]
                                }
                            ]
                        },
                        {
                            "title": "Market Data Ingestion with yfinance",
                            "duration_min": 20,
                            "concept": "yfinance provides free access to Yahoo Finance data — daily OHLCV, fundamentals, and options chains. For rapid prototyping, it's the fastest way to get real price data without API keys or paid subscriptions.",
                            "why_it_matters": "Working with real data exposes you to gaps, stock splits, dividend adjustments, and delisted tickers — all the friction that separates academic backtest results from live trading. Learn to distrust clean data.",
                            "code_example": """import yfinance as yf
import pandas as pd
import numpy as np

# Download SPY + TLT (classic risk-on/risk-off pair)
tickers = ["SPY", "TLT"]
data = yf.download(tickers, start="2020-01-01", end="2024-12-31", auto_adjust=True)["Close"]

# Clean: drop any row with NaN (rare but happens on holidays)
data = data.dropna()
returns = data.pct_change().dropna()

# Correlation matrix
print("Correlation matrix:")
print(returns.corr().round(3))

# 60/40 portfolio rebalanced monthly
weights = {"SPY": 0.6, "TLT": 0.4}
port_returns = returns @ pd.Series(weights)
print(f"\\nPortfolio Sharpe: {port_returns.mean() / port_returns.std() * np.sqrt(252):.2f}")
print(f"SPY Sharpe      : {returns['SPY'].mean() / returns['SPY'].std() * np.sqrt(252):.2f}")""",
                            "exercises": [
                                {
                                    "prompt": "Download 3 years of data for AAPL, MSFT, and GOOGL. Compute: (1) annualised return for each, (2) annualised volatility for each, (3) pairwise correlations. Print a clean summary table.",
                                    "starter_code": "import yfinance as yf\nimport pandas as pd\nimport numpy as np\n\n# Your code here\n",
                                    "hints": ["Use yf.download(['AAPL', 'MSFT', 'GOOGL'], ...)['Close']", "Annualised return = returns.mean() * 252"]
                                }
                            ]
                        },
                        {
                            "title": "Returns, Volatility, and Rolling Statistics",
                            "duration_min": 25,
                            "concept": "Log returns are additive across time (critical for multi-period analysis). Realised volatility is the annualised standard deviation of log returns. Rolling statistics reveal how risk regimes evolve over time — a static Sharpe ratio tells you nothing about regime changes.",
                            "why_it_matters": "Volatility is the primary input to every options pricing model, risk system, and position sizer. Understanding volatility clustering (GARCH effects) is what separates naive backtests from strategies that survive real markets.",
                            "code_example": """import numpy as np
import pandas as pd

np.random.seed(42)
# Simulate two volatility regimes (calm then turbulent)
calm   = np.random.normal(0.0005, 0.008, 200)
turb   = np.random.normal(-0.001, 0.025, 100)
prices = 100 * np.cumprod(1 + np.concatenate([calm, turb]))
idx    = pd.date_range("2022-01-01", periods=300, freq="B")
s      = pd.Series(prices, index=idx)

log_ret = np.log(s / s.shift(1)).dropna()

# Realised vol (21-day rolling)
rv = log_ret.rolling(21).std() * np.sqrt(252)

print("Overall stats:")
print(f"  Ann. return : {log_ret.mean() * 252:.2%}")
print(f"  Ann. vol    : {log_ret.std() * np.sqrt(252):.2%}")
print(f"  Sharpe      : {log_ret.mean() / log_ret.std() * np.sqrt(252):.2f}")
print(f"\\nRolling vol — calm regime median : {rv.iloc[:200].median():.2%}")
print(f"Rolling vol — turb regime median : {rv.iloc[200:].median():.2%}")

# Vol of vol (vol regime stability)
print(f"\\nVol-of-vol: {rv.std():.3f}")""",
                            "exercises": [
                                {
                                    "prompt": "Using a price series of your choice (synthetic or real), compute: (1) 21-day realised vol, (2) 63-day realised vol, (3) the ratio of 21d/63d vol (vol term structure). Identify the top-5 dates where short-term vol exceeded long-term vol by the largest margin.",
                                    "starter_code": "import numpy as np\nimport pandas as pd\n\nnp.random.seed(99)\nprices = 100 * (1 + pd.Series(np.random.normal(0.0003, 0.015, 500))).cumprod()\nprices.index = pd.date_range('2022-01-01', periods=500, freq='B')\n\n# Your code here\n",
                                    "hints": ["rv21 = log_ret.rolling(21).std() * np.sqrt(252)", "ratio = rv21 / rv63; ratio.nlargest(5)"]
                                }
                            ]
                        }
                    ]
                },
                # ── Q2 ────────────────────────────────────────────────────────
                {
                    "slug": "Q2",
                    "title": "Backtesting & Strategy Evaluation",
                    "description": "Build production-quality backtesting infrastructure. Learn to compute Sharpe, drawdown, turnover, and transaction costs — and understand why most published backtests are wrong.",
                    "lessons": [
                        {
                            "title": "Backtesting Architecture",
                            "duration_min": 30,
                            "concept": "A backtest has four layers: (1) Signal — when to trade, (2) Position — how much to hold, (3) Returns — what the P&L was, (4) Metrics — how good was it. Confusing these layers is the root cause of most backtest bugs.",
                            "why_it_matters": "A backtest without look-ahead bias, slippage, and transaction costs is not a backtest — it is an optimistic fiction. Understanding the plumbing is the difference between strategies that work in simulation and strategies that work in production.",
                            "code_example": """import numpy as np
import pandas as pd

def backtest(prices: pd.Series, signal: pd.Series, tc: float = 0.001) -> pd.Series:
    \"\"\"
    Vectorised backtest.
    signal: +1 long, -1 short, 0 flat (computed on prior close, executed on next open)
    tc: one-way transaction cost as fraction of price
    \"\"\"
    # Shift signal by 1 to avoid look-ahead bias
    pos = signal.shift(1).fillna(0)

    # Daily returns of the strategy
    asset_ret = prices.pct_change()
    strat_ret = pos * asset_ret

    # Transaction costs: pay tc on each unit of turnover
    turnover = pos.diff().abs()
    cost = turnover * tc
    strat_ret -= cost

    return strat_ret.dropna()


def performance(returns: pd.Series) -> dict:
    \"\"\"Key performance metrics.\"\"\"
    ann_ret = returns.mean() * 252
    ann_vol = returns.std() * np.sqrt(252)
    sharpe  = ann_ret / ann_vol if ann_vol else 0
    cumret  = (1 + returns).cumprod()
    peak    = cumret.cummax()
    dd      = (cumret - peak) / peak
    max_dd  = dd.min()
    calmar  = ann_ret / abs(max_dd) if max_dd else 0
    return {"ann_return": ann_ret, "ann_vol": ann_vol,
            "sharpe": sharpe, "max_drawdown": max_dd, "calmar": calmar}


np.random.seed(42)
prices = 100 * pd.Series(np.cumprod(1 + np.random.normal(0.0005, 0.015, 500)))
# Simple moving average crossover signal
ma_fast = prices.rolling(10).mean()
ma_slow = prices.rolling(40).mean()
signal = np.sign(ma_fast - ma_slow)

ret = backtest(prices, signal, tc=0.001)
p   = performance(ret)
print(f"Sharpe:       {p['sharpe']:.2f}")
print(f"Ann. return:  {p['ann_return']:.2%}")
print(f"Max drawdown: {p['max_drawdown']:.2%}")
print(f"Calmar:       {p['calmar']:.2f}")""",
                            "exercises": [
                                {
                                    "prompt": "Implement a momentum strategy: go long when the 20-day return is positive, short when negative. Backtest it on 500 days of synthetic price data with 0.1% transaction costs. Report Sharpe, max drawdown, and Calmar ratio. Then compare with zero transaction costs to see how much costs matter.",
                                    "starter_code": "import numpy as np\nimport pandas as pd\n\nnp.random.seed(5)\nprices = 100 * pd.Series(np.cumprod(1 + np.random.normal(0.0004, 0.013, 500)))\n\n# Build backtest engine and run both scenarios\n",
                                    "hints": ["Signal = np.sign(prices.pct_change(20))", "Compare sharpe with tc=0 vs tc=0.001"]
                                }
                            ]
                        },
                        {
                            "title": "Walk-Forward Analysis & Overfitting",
                            "duration_min": 25,
                            "concept": "In-sample optimisation followed by out-of-sample evaluation is the only valid backtest methodology. Walk-forward analysis simulates how you would have re-optimised the strategy in real time, preventing parameter overfitting.",
                            "why_it_matters": "The number-one cause of strategy failure in live trading is overfitting. A strategy with a Sharpe of 2.5 in-sample that delivers 0.3 out-of-sample is not a strategy — it is a curve-fit to historical noise.",
                            "code_example": """import numpy as np
import pandas as pd

np.random.seed(42)
prices = 100 * pd.Series(np.cumprod(1 + np.random.normal(0.0003, 0.015, 1000)))

def sharpe(ret): return ret.mean() / ret.std() * np.sqrt(252) if ret.std() else 0

def ma_backtest(prices, fast, slow):
    sig = np.sign(prices.rolling(fast).mean() - prices.rolling(slow).mean())
    ret = (sig.shift(1) * prices.pct_change()).dropna()
    return ret

# Walk-forward: train 252 days, test 63 days
train_size, test_size = 252, 63
fast_range = [5, 10, 20]
slow_range = [30, 50, 100]

all_oos = []
for start in range(0, len(prices) - train_size - test_size, test_size):
    train = prices.iloc[start : start + train_size]
    test  = prices.iloc[start + train_size : start + train_size + test_size]

    # Find best params in-sample
    best_sharpe, best_fast, best_slow = -np.inf, 10, 50
    for f in fast_range:
        for s in slow_range:
            if f >= s: continue
            r = ma_backtest(train, f, s)
            sh = sharpe(r)
            if sh > best_sharpe:
                best_sharpe, best_fast, best_slow = sh, f, s

    # Apply best params out-of-sample
    oos_ret = ma_backtest(test, best_fast, best_slow)
    all_oos.append(oos_ret)

oos = pd.concat(all_oos)
print(f"WF OOS Sharpe: {sharpe(oos):.2f}")
print(f"WF OOS Ann Return: {oos.mean() * 252:.2%}")""",
                            "exercises": [
                                {
                                    "prompt": "Implement a simple walk-forward test on a mean-reversion strategy (go long when 5-day return < -2%, short when > +2%). Compare in-sample Sharpe vs out-of-sample Sharpe across 5 folds of 200 days each. Print the degradation ratio (OOS Sharpe / IS Sharpe).",
                                    "starter_code": "import numpy as np\nimport pandas as pd\n\nnp.random.seed(3)\nprices = 100 * pd.Series(np.cumprod(1 + np.random.normal(0.0003, 0.014, 1200)))\n\n# Your code here\n",
                                    "hints": ["Degradation ratio < 0.5 is a red flag for overfitting", "Use iloc[start:start+200] for each fold"]
                                }
                            ]
                        }
                    ]
                },
                # ── Q3 ────────────────────────────────────────────────────────
                {
                    "slug": "Q3",
                    "title": "Statistical Thinking for Quants",
                    "description": "Learn to think probabilistically about strategy returns. Hypothesis testing, confidence intervals, Monte Carlo simulation, and the statistics of overfitting.",
                    "lessons": [
                        {
                            "title": "Hypothesis Testing for Strategy Returns",
                            "duration_min": 25,
                            "concept": "A strategy's positive backtest return could be luck. A t-test against the null hypothesis of zero mean tests whether the observed Sharpe ratio is statistically significant. With fewer than 252 trades, most strategies cannot be distinguished from noise at the 5% level.",
                            "why_it_matters": "Institutional quants routinely discard strategies with t-stats below 2.0. Understanding the minimum track record length needed to achieve statistical significance is fundamental to research credibility.",
                            "code_example": """import numpy as np
import pandas as pd
from scipy import stats

np.random.seed(42)
# Strategy with genuine edge: mean=0.0005
returns = np.random.normal(0.0005, 0.015, 252)

t_stat, p_value = stats.ttest_1samp(returns, popmean=0)
sharpe = returns.mean() / returns.std() * np.sqrt(252)

print(f"Sharpe ratio : {sharpe:.2f}")
print(f"t-statistic  : {t_stat:.2f}")
print(f"p-value      : {p_value:.4f}")
print(f"Significant (p<0.05): {p_value < 0.05}")

# How many observations needed for significance?
print("\\nMinimum observations for significance at 5% level:")
for target_sharpe in [0.5, 1.0, 1.5, 2.0]:
    # t = sharpe * sqrt(n/252) >= 1.96
    n_needed = int(np.ceil((1.96 / target_sharpe * np.sqrt(252))**2))
    print(f"  Sharpe {target_sharpe}: {n_needed} trading days ({n_needed//252:.1f} years)")""",
                            "exercises": [
                                {
                                    "prompt": "Run a permutation test on a strategy: shuffle the return series 1000 times and compute Sharpe for each shuffle. Plot the distribution of shuffled Sharpes and compute the empirical p-value (fraction of shuffled Sharpes exceeding the real Sharpe). This is more robust than the t-test for non-normal returns.",
                                    "starter_code": "import numpy as np\nimport pandas as pd\n\nnp.random.seed(42)\n# Strategy with mild edge\nreturns = np.random.normal(0.0004, 0.015, 500)\nreal_sharpe = returns.mean() / returns.std() * np.sqrt(252)\n\n# Run permutation test\nN_PERMUTATIONS = 1000\n# Your code here\n",
                                    "hints": ["shuffled = returns.copy(); np.random.shuffle(shuffled)", "p_value = (shuffled_sharpes >= real_sharpe).mean()"]
                                }
                            ]
                        },
                        {
                            "title": "Monte Carlo Simulation for Robustness",
                            "duration_min": 30,
                            "concept": "Monte Carlo simulation estimates the distribution of outcomes by sampling from historical returns (bootstrapping) or a parametric model. It answers: 'What is the probability my strategy hits a 20% drawdown in the next 6 months?'",
                            "why_it_matters": "A single backtest path is one realisation of many possible histories. Monte Carlo gives you the full distribution of drawdowns, Sharpe ratios, and ruin probabilities — critical inputs for position sizing and risk management.",
                            "code_example": """import numpy as np
import pandas as pd

np.random.seed(42)
# Historical strategy returns
hist_returns = np.random.normal(0.0005, 0.015, 252)

def simulate_paths(returns, n_periods=252, n_sims=1000):
    \"\"\"Bootstrap Monte Carlo — resample from historical distribution.\"\"\"
    paths = np.zeros((n_sims, n_periods))
    for i in range(n_sims):
        sampled = np.random.choice(returns, size=n_periods, replace=True)
        paths[i] = np.cumprod(1 + sampled)
    return paths

paths = simulate_paths(hist_returns)
final_values = paths[:, -1]

# Drawdown for each path
def max_drawdown(path):
    peak = np.maximum.accumulate(path)
    return ((path - peak) / peak).min()

drawdowns = np.array([max_drawdown(p) for p in paths])

print(f"Median final value     : {np.median(final_values):.2f}")
print(f"5th percentile         : {np.percentile(final_values, 5):.2f}")
print(f"Probability of loss    : {(final_values < 1).mean():.1%}")
print(f"Median max drawdown    : {np.median(drawdowns):.2%}")
print(f"95th pct max drawdown  : {np.percentile(drawdowns, 95):.2%}")
print(f"P(drawdown > 20%)      : {(drawdowns < -0.20).mean():.1%}")""",
                            "exercises": [
                                {
                                    "prompt": "Using Monte Carlo simulation (1000 paths, 252 days), determine the Kelly fraction for a strategy with daily mean return 0.0006 and daily vol 0.014. Then simulate full-Kelly, half-Kelly, and quarter-Kelly portfolios. Compare median final value and probability of 30% drawdown for each.",
                                    "starter_code": "import numpy as np\n\nnp.random.seed(42)\nmu = 0.0006\nvol = 0.014\n\n# Kelly fraction = mu / vol^2\nkelly = mu / vol**2\nprint(f'Full Kelly: {kelly:.2f}x leverage')\n\n# Simulate three leverage scenarios\n# Your code here\n",
                                    "hints": ["Simulate: return_t = leverage * np.random.normal(mu, vol)", "P(30% drawdown) = (drawdowns < -0.30).mean()"]
                                }
                            ]
                        }
                    ]
                },
                # ── Q4 ────────────────────────────────────────────────────────
                {
                    "slug": "Q4",
                    "title": "Market Regime Modeling",
                    "description": "Model changing market conditions using Hidden Markov Models and volatility clustering. Build regime-adaptive strategies that behave differently in bull, bear, and high-vol environments.",
                    "lessons": [
                        {
                            "title": "Volatility Regimes with Rolling Statistics",
                            "duration_min": 25,
                            "concept": "Markets exhibit volatility clustering: periods of calm are followed by periods of turbulence. Identifying regimes using rolling realised volatility allows you to adapt position sizes and strategy parameters to the current market environment.",
                            "why_it_matters": "A trend-following strategy that works brilliantly in 2020 volatility will be destroyed by transaction costs in a low-vol grinding market. Regime detection is how systematic funds stay alive across market cycles.",
                            "code_example": """import numpy as np
import pandas as pd

np.random.seed(42)
# Three regime simulation: calm, trending, turbulent
regimes = np.concatenate([
    np.random.normal(0.0003, 0.007, 200),   # calm
    np.random.normal(0.0008, 0.012, 150),   # trending
    np.random.normal(-0.001, 0.025, 150),   # turbulent
])
prices = 100 * pd.Series(np.cumprod(1 + regimes))
log_ret = np.log(prices / prices.shift(1)).dropna()

# Identify regimes using rolling vol
rv = log_ret.rolling(21).std() * np.sqrt(252)
vol_thresh_high = rv.quantile(0.75)
vol_thresh_low  = rv.quantile(0.25)

regime = pd.Series("normal", index=rv.index)
regime[rv > vol_thresh_high] = "high_vol"
regime[rv < vol_thresh_low]  = "low_vol"

# Strategy performance by regime
for r in ["low_vol", "normal", "high_vol"]:
    mask = regime == r
    r_returns = log_ret[mask]
    sharpe = r_returns.mean() / r_returns.std() * np.sqrt(252) if len(r_returns) > 10 else 0
    print(f"{r:10s}: n={mask.sum():3d}, Sharpe={sharpe:.2f}, Vol={r_returns.std()*np.sqrt(252):.2%}")""",
                            "exercises": [
                                {
                                    "prompt": "Implement a regime-switching position sizer: use 1x leverage in low-vol regime, 0.5x in normal, 0.25x in high-vol. Apply this to a fixed long-only strategy on 500 days of data. Compare the regime-adjusted Sharpe vs fixed 1x leverage. Show the result.",
                                    "starter_code": "import numpy as np\nimport pandas as pd\n\nnp.random.seed(42)\nprices = 100 * pd.Series(np.cumprod(1 + np.random.normal(0.0004, 0.014, 500)))\nlog_ret = np.log(prices / prices.shift(1)).dropna()\n\n# Your code here\n",
                                    "hints": ["rv = log_ret.rolling(21).std() * np.sqrt(252)", "leverage[rv > high_thresh] = 0.25"]
                                }
                            ]
                        }
                    ]
                },
                # ── Q5 ────────────────────────────────────────────────────────
                {
                    "slug": "Q5",
                    "title": "Portfolio Construction",
                    "description": "Build multi-asset portfolios using Modern Portfolio Theory, PCA factor decomposition, and risk-parity approaches. Learn to size positions correctly using Kelly criterion and volatility targeting.",
                    "lessons": [
                        {
                            "title": "Modern Portfolio Theory & Risk Metrics",
                            "duration_min": 30,
                            "concept": "MPT finds the portfolio that maximises expected return for a given level of risk (mean-variance optimisation). In practice, raw MPT is unstable due to estimation error in the covariance matrix. Risk-parity and volatility targeting are more robust alternatives.",
                            "why_it_matters": "Position sizing is where alpha goes to die. A strategy with a Sharpe of 1.5 run at 5x leverage with no risk management will still blow up. Getting sizing right is worth more than getting signals right.",
                            "code_example": """import numpy as np
import pandas as pd

np.random.seed(42)
n_assets = 4
# Simulate correlated returns for 4 assets
L = np.linalg.cholesky(np.array([
    [1.00, 0.30, 0.20, 0.10],
    [0.30, 1.00, 0.40, 0.15],
    [0.20, 0.40, 1.00, 0.25],
    [0.10, 0.15, 0.25, 1.00],
]))
raw = np.random.normal(0, 1, (500, n_assets))
corr_ret = raw @ L.T * 0.012 + np.array([0.0006, 0.0004, 0.0005, 0.0003])
returns = pd.DataFrame(corr_ret, columns=["A", "B", "C", "D"])

# Covariance matrix
cov = returns.cov() * 252
mu  = returns.mean() * 252

# Equal weight portfolio
ew = np.ones(n_assets) / n_assets
print(f"Equal weight — Sharpe: {(ew @ mu) / np.sqrt(ew @ cov @ ew):.2f}")

# Risk parity (naive: inverse vol weighting)
vols = np.sqrt(np.diag(cov))
rp = (1/vols) / (1/vols).sum()
print(f"Risk parity  — Sharpe: {(rp @ mu) / np.sqrt(rp @ cov @ rp):.2f}")

# Volatility targeting (scale to 10% annual vol)
port_vol = np.sqrt(rp @ cov @ rp)
target_vol = 0.10
leverage = target_vol / port_vol
print(f"\\nRisk parity leverage for 10% target vol: {leverage:.2f}x")""",
                            "exercises": [
                                {
                                    "prompt": "Implement the Kelly criterion for a multi-asset portfolio: given a vector of expected returns and a covariance matrix, compute the full-Kelly weights (w* = Σ^-1 μ). Compare full-Kelly, half-Kelly, and equal-weight portfolios on their Sharpe ratio and max drawdown over 500 simulated days.",
                                    "starter_code": "import numpy as np\nimport pandas as pd\n\nnp.random.seed(42)\nn = 3\nmu = np.array([0.12, 0.08, 0.10])  # Annual\ncov = np.array([[0.04, 0.01, 0.02],\n                [0.01, 0.03, 0.01],\n                [0.02, 0.01, 0.05]])\n\n# Kelly weights: w = inv(cov) @ mu\n# Your code here\n",
                                    "hints": ["kelly_weights = np.linalg.inv(cov) @ mu", "Simulate daily returns: np.random.multivariate_normal(mu/252, cov/252, 500)"]
                                }
                            ]
                        }
                    ]
                },
                # ── Q6 ────────────────────────────────────────────────────────
                {
                    "slug": "Q6",
                    "title": "Research Workflow & Memo Writing",
                    "description": "The complete research lifecycle from hypothesis to institutional-grade memo. Learn to document your findings, avoid common biases, and communicate results clearly.",
                    "lessons": [
                        {
                            "title": "The Research Lifecycle",
                            "duration_min": 20,
                            "concept": "Professional quant research follows a structured lifecycle: (1) Hypothesis formation, (2) Data acquisition and cleaning, (3) Signal construction, (4) Backtesting with transaction costs, (5) Regime analysis, (6) Robustness checks, (7) Memo writing. Skipping any step introduces silent errors.",
                            "why_it_matters": "The discipline of writing research memos forces you to articulate what you tested, what you assumed, and what could be wrong. A strategy that can't be clearly documented is a strategy you don't fully understand.",
                            "code_example": """# Research Memo Template
MEMO = \"\"\"
RESEARCH MEMO
=============
Date     : 2024-03-01
Author   : [Your Name]
Title    : Momentum Factor on US Equities (2020-2024)

HYPOTHESIS
----------
Stocks with positive 12-1 month return momentum continue to outperform
on a 1-month horizon, consistent with Jegadeesh & Titman (1993).

METHOD
------
- Universe: SPY constituents, daily adjusted close (yfinance)
- Signal: 12-1 month return (252-day return minus 21-day return)
- Position: Long top decile, short bottom decile, rebalanced monthly
- Transaction costs: 10bps one-way

RESULTS
-------
- Annualised return: 8.4%
- Annualised vol: 12.1%
- Sharpe ratio: 0.69
- Max drawdown: -18.3%
- t-stat: 2.1 (p=0.04)

KEY INSIGHT
-----------
Most of the return came from avoiding the short-term reversal (1-month)
while capturing the 12-month trend. The strategy is regime-sensitive:
works poorly in high-vol environments (Sharpe drops to 0.2 in VIX > 30).

RISKS & BIASES
--------------
- Survivorship bias: using current SPY constituents
- Capacity: large-cap only, may not hold for smaller stocks
- Look-ahead: careful to shift signal by 1 month before applying

NEXT STEPS
----------
1. Test on international equities
2. Combine with value factor for reduced drawdown
3. Regime-adjust position sizes based on VIX level
\"\"\"
print(MEMO)""",
                            "exercises": [
                                {
                                    "prompt": "Write a complete research lifecycle in code: (1) Generate a hypothesis about mean reversion, (2) Build and test the signal, (3) Compute all key metrics, (4) Print a formatted research memo. The memo must include: hypothesis, method, results (Sharpe/drawdown/t-stat), one key insight, and one identified bias.",
                                    "starter_code": "import numpy as np\nimport pandas as pd\nfrom scipy import stats\n\nnp.random.seed(42)\n# Your full research lifecycle here\n# End with printing a formatted memo\n",
                                    "hints": ["Structure: build signal → backtest → metrics → print memo", "t_stat, p_val = stats.ttest_1samp(returns, popmean=0)"]
                                }
                            ]
                        }
                    ]
                },
            ]
        },
        {
            "name": "Track 2: AI Engineering Systems",
            "modules": [
                # ── A1 ────────────────────────────────────────────────────────
                {
                    "slug": "A1",
                    "title": "Python Fundamentals for AI Engineers",
                    "description": "Production Python patterns: type hints, dataclasses, error handling, and the patterns used in real AI engineering codebases.",
                    "lessons": [
                        {
                            "title": "Data Structures & Type Hints",
                            "duration_min": 20,
                            "concept": "Modern Python uses type hints for clarity and tooling support. Dataclasses and TypedDicts are the backbone of AI system data models — they replace ad-hoc dicts with structured, validated objects.",
                            "why_it_matters": "AI systems process structured data at scale. A bug caused by an unexpected dict key costs hours to debug. Type hints catch these errors at development time and make your code readable by the LLMs you'll use to extend it.",
                            "code_example": """from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

@dataclass
class TradeSignal:
    ticker: str
    direction: int          # +1 long, -1 short, 0 flat
    confidence: float       # 0.0–1.0
    generated_at: datetime = field(default_factory=datetime.utcnow)
    metadata: dict = field(default_factory=dict)

    def __post_init__(self):
        if not -1 <= self.direction <= 1:
            raise ValueError(f"direction must be -1, 0, or 1, got {self.direction}")
        if not 0 <= self.confidence <= 1:
            raise ValueError(f"confidence must be 0–1, got {self.confidence}")

@dataclass
class PortfolioPosition:
    ticker: str
    shares: float
    entry_price: float
    current_price: float
    stop_loss: Optional[float] = None

    @property
    def pnl(self) -> float:
        return self.shares * (self.current_price - self.entry_price)

    @property
    def pnl_pct(self) -> float:
        return (self.current_price - self.entry_price) / self.entry_price

# Usage
sig = TradeSignal("AAPL", direction=1, confidence=0.82)
pos = PortfolioPosition("AAPL", shares=100, entry_price=180.0, current_price=185.5)
print(f"Signal: {sig.ticker} {'LONG' if sig.direction > 0 else 'SHORT'} ({sig.confidence:.0%} confidence)")
print(f"Position PnL: ${pos.pnl:.2f} ({pos.pnl_pct:.2%})")""",
                            "exercises": [
                                {
                                    "prompt": "Create a dataclass `ResearchResult` with fields: strategy_name (str), sharpe (float), max_drawdown (float), n_trades (int), is_significant (bool). Add a `summary()` method that returns a formatted string. Add validation: sharpe must be between -10 and 10, max_drawdown must be negative. Create 3 instances and print their summaries.",
                                    "starter_code": "from dataclasses import dataclass\nfrom typing import Optional\n\n# Your code here\n",
                                    "hints": ["Use __post_init__ for validation", "f-string formatting: f'Sharpe: {self.sharpe:.2f}'"]
                                }
                            ]
                        }
                    ]
                },
                # ── A2 ────────────────────────────────────────────────────────
                {
                    "slug": "A2",
                    "title": "APIs & Data Handling",
                    "description": "Build data pipelines using REST APIs, requests, and Pandas. Learn to handle pagination, rate limits, errors, and data cleaning in production systems.",
                    "lessons": [
                        {
                            "title": "REST APIs with requests",
                            "duration_min": 20,
                            "concept": "Every financial data source — market data, news, alternative data — exposes a REST API. Understanding HTTP methods, authentication headers, pagination, and error handling is essential for building reliable data pipelines.",
                            "why_it_matters": "Your alpha is only as good as your data. A data pipeline that silently drops rows or crashes on a 429 rate limit error will produce subtly wrong results that are harder to debug than an obvious failure.",
                            "code_example": """import requests
import time
from typing import Optional

class RateLimitedClient:
    \"\"\"API client with retry logic and rate limit handling.\"\"\"
    def __init__(self, base_url: str, api_key: Optional[str] = None, rpm: int = 60):
        self.base_url = base_url
        self.headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
        self.min_interval = 60.0 / rpm
        self._last_call = 0.0

    def get(self, endpoint: str, params: dict = None, max_retries: int = 3) -> dict:
        # Enforce rate limit
        elapsed = time.time() - self._last_call
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)

        for attempt in range(max_retries):
            try:
                resp = requests.get(
                    f"{self.base_url}/{endpoint}",
                    headers=self.headers,
                    params=params or {},
                    timeout=10,
                )
                self._last_call = time.time()
                resp.raise_for_status()
                return resp.json()
            except requests.exceptions.HTTPError as e:
                if resp.status_code == 429:  # Rate limited
                    wait = 2 ** attempt
                    print(f"Rate limited. Waiting {wait}s...")
                    time.sleep(wait)
                elif resp.status_code >= 500:
                    time.sleep(2 ** attempt)
                else:
                    raise
            except requests.exceptions.Timeout:
                if attempt == max_retries - 1:
                    raise
                time.sleep(2 ** attempt)
        raise RuntimeError(f"Failed after {max_retries} retries")

# Demo with a free public API
client = RateLimitedClient("https://api.coinbase.com/v2", rpm=30)
try:
    data = client.get("prices/BTC-USD/spot")
    print(f"BTC/USD spot: ${float(data['data']['amount']):,.2f}")
except Exception as e:
    print(f"API call failed: {e} (expected in sandbox)")""",
                            "exercises": [
                                {
                                    "prompt": "Build a function `fetch_with_pagination(url, params, max_pages=5)` that fetches paginated API results, handling the case where each response includes a 'next_page' field. Return all results as a flat list. Then write a function `clean_numeric_cols(df, cols)` that converts columns to float, coerces errors to NaN, and drops rows where all specified columns are NaN.",
                                    "starter_code": "import requests\nimport pandas as pd\nfrom typing import Optional\n\ndef fetch_with_pagination(url: str, params: dict, max_pages: int = 5) -> list:\n    # Your code here\n    pass\n\ndef clean_numeric_cols(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:\n    # Your code here\n    pass\n\n# Test with mock data\nif __name__ == '__main__':\n    import pandas as pd\n    df = pd.DataFrame({'price': ['100.5', 'N/A', '102.1', ''], 'vol': ['1M', '2M', 'bad', '3M']})\n    print(clean_numeric_cols(df, ['price']))\n",
                                    "hints": ["pd.to_numeric(df[col], errors='coerce')", "df.dropna(subset=cols, how='all')"]
                                }
                            ]
                        }
                    ]
                },
                # ── A3 ────────────────────────────────────────────────────────
                {
                    "slug": "A3",
                    "title": "LLM Integration",
                    "description": "Integrate Claude and other LLMs into Python applications. Learn prompting patterns, structured outputs, and the Anthropic SDK.",
                    "lessons": [
                        {
                            "title": "Claude API & Structured Outputs",
                            "duration_min": 25,
                            "concept": "The Anthropic SDK provides a simple interface to Claude. Structured output prompting — asking the LLM to return JSON — turns natural language into machine-readable data. This is the foundation of every AI-powered pipeline.",
                            "why_it_matters": "The gap between 'demo' and 'production' AI systems is structured outputs. If your LLM returns free text, you can't build reliable pipelines. Forcing JSON output with schema validation is the first step to production-ready AI.",
                            "code_example": """import anthropic
import json

client = anthropic.Anthropic()  # Uses ANTHROPIC_API_KEY env var

def analyse_strategy_description(description: str) -> dict:
    \"\"\"Extract structured strategy parameters from natural language.\"\"\"
    prompt = f\"\"\"Analyse this trading strategy description and extract key parameters.
Return ONLY valid JSON with this exact schema (no markdown, no explanation):
{{
  "strategy_type": "momentum | mean_reversion | arbitrage | ml | other",
  "asset_class": "equities | futures | fx | crypto | fixed_income | multi",
  "holding_period": "intraday | daily | weekly | monthly",
  "key_signals": ["signal1", "signal2"],
  "main_risk": "one sentence describing the primary risk",
  "complexity": 1-5
}}

Strategy description: {description}\"\"\"

    msg = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(msg.content[0].text)

# Example usage (requires API key)
desc = \"\"\"Buy stocks that have outperformed the market over the last 12 months
but underperformed over the last month, then hold for 3 months.\"\"\"

try:
    result = analyse_strategy_description(desc)
    print(json.dumps(result, indent=2))
except Exception as e:
    # Fallback demo output
    print(json.dumps({
        "strategy_type": "momentum", "asset_class": "equities",
        "holding_period": "monthly", "key_signals": ["12-1 month return"],
        "main_risk": "momentum crashes in sharp reversals", "complexity": 2
    }, indent=2))""",
                            "exercises": [
                                {
                                    "prompt": "Build a function `extract_research_insights(text: str) -> dict` that uses Claude to extract from a research paper abstract: the main claim, methodology, data period, and one limitation. The function must always return valid JSON. Add a fallback that returns a structured error dict if the API call fails. Test it with a sample abstract.",
                                    "starter_code": "import anthropic\nimport json\nfrom typing import Optional\n\ndef extract_research_insights(text: str) -> dict:\n    \"\"\"Extract structured insights from research text.\"\"\"\n    # Your code here\n    pass\n\n# Test abstract\nABSTRACT = \"\"\"\nWe document a robust momentum effect in US equities from 1927 to 2023.\nStocks ranked in the top decile by 12-1 month return earn 1.2% per month\nalpha over the subsequent month. The effect is stronger in large caps\nbut reverses sharply during market downturns.\n\"\"\"\nprint(extract_research_insights(ABSTRACT))\n",
                                    "hints": ["Wrap json.loads() in try/except", "Return {'error': str(e), 'raw': text} on failure"]
                                }
                            ]
                        }
                    ]
                },
                # ── A4 ────────────────────────────────────────────────────────
                {
                    "slug": "A4",
                    "title": "FastAPI Development",
                    "description": "Build production-grade REST APIs with FastAPI. Async endpoints, Pydantic validation, dependency injection, and OpenAPI documentation.",
                    "lessons": [
                        {
                            "title": "FastAPI Endpoints & Pydantic Models",
                            "duration_min": 25,
                            "concept": "FastAPI is the standard for Python APIs in AI systems. It provides automatic OpenAPI docs, async support, and Pydantic validation — you define the data contract once and get request parsing, response serialisation, and documentation for free.",
                            "why_it_matters": "Every AI product you build needs an API layer. FastAPI is fast enough to run LLM inference endpoints in production (e.g. streaming responses) and has first-class integration with SQLAlchemy and the Anthropic SDK.",
                            "code_example": """from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

app = FastAPI(title="Quant Research API", version="1.0.0")

class StrategyIn(BaseModel):
    name: str
    ticker: str
    lookback_days: int = 20
    transaction_cost_bps: float = 10.0

    @field_validator("lookback_days")
    @classmethod
    def lookback_must_be_positive(cls, v):
        if v < 1 or v > 500:
            raise ValueError("lookback_days must be between 1 and 500")
        return v

class StrategyResult(BaseModel):
    strategy_name: str
    sharpe: float
    ann_return: float
    max_drawdown: float
    n_trades: int
    computed_at: datetime

@app.post("/backtest", response_model=StrategyResult)
async def run_backtest(strategy: StrategyIn):
    import numpy as np
    # Mock backtest — replace with real engine
    np.random.seed(42)
    returns = np.random.normal(0.0004, 0.013, 252)
    sharpe = returns.mean() / returns.std() * np.sqrt(252)
    return StrategyResult(
        strategy_name=strategy.name,
        sharpe=round(sharpe, 2),
        ann_return=round(returns.mean() * 252, 4),
        max_drawdown=round(float(np.min(np.cumsum(returns))), 4),
        n_trades=252 // strategy.lookback_days,
        computed_at=datetime.utcnow(),
    )

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

# To run: uvicorn main:app --reload
print("FastAPI app defined. Run with: uvicorn main:app --reload")
print("Docs at: http://localhost:8000/docs")""",
                            "exercises": [
                                {
                                    "prompt": "Build a FastAPI app with two endpoints: POST /signal that accepts {ticker, lookback_days} and returns {ticker, signal: 1|-1|0, confidence: float, reason: str}, and GET /signals/history that returns the last 5 signals stored in a simple in-memory list. Add input validation: lookback must be 5-252, ticker must be uppercase.",
                                    "starter_code": "from fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel, field_validator\nfrom datetime import datetime\n\napp = FastAPI()\nsignal_history = []\n\n# Your code here\n",
                                    "hints": ["Use a module-level list for in-memory storage", "@field_validator to enforce uppercase: return v.upper()"]
                                }
                            ]
                        }
                    ]
                },
                # ── A5 ────────────────────────────────────────────────────────
                {
                    "slug": "A5",
                    "title": "Databases & Data Pipelines",
                    "description": "Design SQLite/PostgreSQL schemas for financial data. Build ingestion pipelines with SQLAlchemy and learn the patterns used in production data systems.",
                    "lessons": [
                        {
                            "title": "SQLAlchemy Schema Design for Financial Data",
                            "duration_min": 25,
                            "concept": "A good database schema for financial data separates raw data (immutable) from derived data (recomputable). Use composite indexes on (ticker, date) for time-series queries. Never store prices without their source and adjustment method.",
                            "why_it_matters": "The hardest bugs in quant systems are data bugs — using adjusted vs unadjusted prices, double-counting splits, timezone mismatches. A well-designed schema with constraints prevents these silently.",
                            "code_example": """from sqlalchemy import (
    create_engine, Column, Integer, String, Float,
    Date, DateTime, UniqueConstraint, Index
)
from sqlalchemy.orm import DeclarativeBase, Session
from datetime import date, datetime

class Base(DeclarativeBase):
    pass

class PriceBar(Base):
    \"\"\"Daily OHLCV price bar — immutable raw data.\"\"\"
    __tablename__ = "price_bars"
    id          = Column(Integer, primary_key=True)
    ticker      = Column(String(20), nullable=False)
    bar_date    = Column(Date, nullable=False)
    open        = Column(Float, nullable=False)
    high        = Column(Float, nullable=False)
    low         = Column(Float, nullable=False)
    close       = Column(Float, nullable=False)
    adj_close   = Column(Float, nullable=False)
    volume      = Column(Float, nullable=False)
    source      = Column(String(50), default="yfinance")
    ingested_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (
        UniqueConstraint("ticker", "bar_date", name="uq_ticker_date"),
        Index("ix_ticker_date", "ticker", "bar_date"),
    )

class StrategySignal(Base):
    \"\"\"Derived signals — recomputable from price_bars.\"\"\"
    __tablename__ = "strategy_signals"
    id          = Column(Integer, primary_key=True)
    ticker      = Column(String(20), nullable=False)
    signal_date = Column(Date, nullable=False)
    strategy    = Column(String(50), nullable=False)
    value       = Column(Float, nullable=False)     # e.g. z-score
    direction   = Column(Integer, nullable=False)   # +1, -1, 0
    __table_args__ = (
        UniqueConstraint("ticker", "signal_date", "strategy"),
    )

# Create in-memory SQLite
engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)
print("Schema created successfully")
print(f"Tables: {list(Base.metadata.tables.keys())}")""",
                            "exercises": [
                                {
                                    "prompt": "Design and create a SQLite schema for a backtesting system with 3 tables: `strategies` (id, name, description, created_at), `backtest_runs` (id, strategy_id, start_date, end_date, sharpe, max_drawdown, n_trades), and `trade_log` (id, run_id, ticker, entry_date, exit_date, return_pct). Insert one strategy, one backtest run, and three trades. Query to find all trades with return > 1%.",
                                    "starter_code": "from sqlalchemy import create_engine, Column, Integer, String, Float, Date, DateTime, ForeignKey\nfrom sqlalchemy.orm import DeclarativeBase, Session, relationship\nfrom datetime import date, datetime\n\nclass Base(DeclarativeBase):\n    pass\n\n# Define tables here\n\nengine = create_engine('sqlite:///:memory:')\nBase.metadata.create_all(engine)\n\n# Insert and query data\n",
                                    "hints": ["ForeignKey('backtest_runs.id') for trade_log.run_id", "session.query(TradeLog).filter(TradeLog.return_pct > 0.01).all()"]
                                }
                            ]
                        }
                    ]
                },
                # ── A6 ────────────────────────────────────────────────────────
                {
                    "slug": "A6",
                    "title": "Structured LLM Workflows",
                    "description": "Build multi-step LLM pipelines: chain prompts, validate outputs, handle failures, and integrate AI into data workflows.",
                    "lessons": [
                        {
                            "title": "Prompt Chaining & Pipeline Patterns",
                            "duration_min": 25,
                            "concept": "Complex AI tasks are best solved by chaining smaller, focused prompts. Each step has a single responsibility, validates its output, and passes structured data to the next step. This makes debugging, testing, and improvement much easier than one giant prompt.",
                            "why_it_matters": "A single prompt asking Claude to 'analyse this earnings report and generate trade signals' is brittle. A pipeline that (1) extracts key metrics, (2) compares to expectations, (3) generates a signal with confidence — is testable and improvable.",
                            "code_example": """import anthropic
import json
from dataclasses import dataclass

client = anthropic.Anthropic()

@dataclass
class EarningsSignal:
    ticker: str
    eps_surprise_pct: float
    revenue_surprise_pct: float
    guidance_sentiment: str  # positive | neutral | negative
    signal: int              # +1, 0, -1
    confidence: float
    reasoning: str

def step1_extract_metrics(earnings_text: str) -> dict:
    \"\"\"Step 1: Extract numerical metrics from earnings text.\"\"\"
    msg = client.messages.create(
        model="claude-opus-4-5", max_tokens=200,
        messages=[{"role": "user", "content": f\"\"\"Extract earnings metrics. Return JSON only:
{{"eps_actual": float, "eps_estimate": float, "revenue_actual_bn": float,
 "revenue_estimate_bn": float}}
Text: {earnings_text}\"\"\"}]
    )
    return json.loads(msg.content[0].text)

def step2_analyse_guidance(earnings_text: str) -> str:
    \"\"\"Step 2: Classify guidance sentiment.\"\"\"
    msg = client.messages.create(
        model="claude-opus-4-5", max_tokens=50,
        messages=[{"role": "user", "content":
            f"Classify guidance tone as exactly one word: positive, neutral, or negative.\\n{earnings_text}"}]
    )
    return msg.content[0].text.strip().lower()

def earnings_pipeline(ticker: str, earnings_text: str) -> EarningsSignal:
    \"\"\"Full pipeline: text → structured signal.\"\"\"
    try:
        metrics  = step1_extract_metrics(earnings_text)
        guidance = step2_analyse_guidance(earnings_text)
        eps_surprise = (metrics["eps_actual"] - metrics["eps_estimate"]) / abs(metrics["eps_estimate"])
        rev_surprise = (metrics["revenue_actual_bn"] - metrics["revenue_estimate_bn"]) / metrics["revenue_estimate_bn"]
        score = (eps_surprise + rev_surprise) / 2
        signal = 1 if score > 0.01 else (-1 if score < -0.01 else 0)
        return EarningsSignal(ticker=ticker, eps_surprise_pct=eps_surprise,
            revenue_surprise_pct=rev_surprise, guidance_sentiment=guidance,
            signal=signal, confidence=min(abs(score) * 10, 1.0),
            reasoning=f"EPS beat {eps_surprise:.1%}, Rev beat {rev_surprise:.1%}")
    except Exception as e:
        return EarningsSignal(ticker=ticker, eps_surprise_pct=0, revenue_surprise_pct=0,
            guidance_sentiment="neutral", signal=0, confidence=0, reasoning=f"Error: {e}")

# Demo (no API key needed for demo output)
print("Pipeline pattern defined. With API key, call:")
print("earnings_pipeline('AAPL', 'EPS: $1.52 vs est $1.45, Revenue: $89.5B vs est $88.1B...')")""",
                            "exercises": [
                                {
                                    "prompt": "Build a 3-step research pipeline: Step 1 uses Claude to classify if a given text is about a macro event (rate decision, inflation data, etc.) — return {is_macro: bool, event_type: str}. Step 2, if macro, extracts {surprise_direction: 'hawkish'|'dovish'|'neutral', magnitude: 1-3}. Step 3 generates {asset_impact: {equities: 1|-1|0, bonds: 1|-1|0, usd: 1|-1|0}}. Handle errors gracefully in each step.",
                                    "starter_code": "import anthropic\nimport json\n\nclient = anthropic.Anthropic()\n\ndef step1_classify(text: str) -> dict:\n    pass\n\ndef step2_extract(text: str) -> dict:\n    pass\n\ndef step3_impact(event_type: str, surprise: dict) -> dict:\n    pass\n\ndef macro_pipeline(text: str) -> dict:\n    pass\n\nprint(macro_pipeline('Fed raises rates by 50bps, surprising markets expecting 25bps'))\n",
                                    "hints": ["Each step should have its own try/except", "Pass context from step to step explicitly"]
                                }
                            ]
                        }
                    ]
                },
                # ── A7 ────────────────────────────────────────────────────────
                {
                    "slug": "A7",
                    "title": "Tools, Agents & RAG",
                    "description": "Build AI agents with tool use, implement retrieval-augmented generation for financial documents, and design multi-agent research pipelines.",
                    "lessons": [
                        {
                            "title": "Claude Tool Use for Financial Data",
                            "duration_min": 30,
                            "concept": "Tool use (function calling) lets Claude decide when and how to call external functions — price data APIs, calculators, databases. The LLM acts as an orchestrator, selecting tools based on the user's request.",
                            "why_it_matters": "An AI research assistant that can autonomously fetch market data, compute statistics, and write a memo is an order of magnitude more powerful than one that only processes text. Tool use is the key capability separating useful AI systems from demos.",
                            "code_example": """import anthropic
import json
import numpy as np

client = anthropic.Anthropic()

# Define tools
tools = [
    {
        "name": "compute_sharpe",
        "description": "Compute the annualised Sharpe ratio from daily returns",
        "input_schema": {
            "type": "object",
            "properties": {
                "mean_return": {"type": "number", "description": "Mean daily return"},
                "std_return":  {"type": "number", "description": "Std dev of daily returns"},
            },
            "required": ["mean_return", "std_return"]
        }
    },
    {
        "name": "estimate_kelly",
        "description": "Estimate Kelly fraction for position sizing",
        "input_schema": {
            "type": "object",
            "properties": {
                "win_rate":    {"type": "number", "description": "Win rate 0-1"},
                "avg_win":     {"type": "number", "description": "Average win as fraction"},
                "avg_loss":    {"type": "number", "description": "Average loss as fraction (positive number)"},
            },
            "required": ["win_rate", "avg_win", "avg_loss"]
        }
    }
]

def execute_tool(name: str, inputs: dict) -> str:
    if name == "compute_sharpe":
        sharpe = (inputs["mean_return"] / inputs["std_return"]) * np.sqrt(252)
        return json.dumps({"sharpe": round(sharpe, 3)})
    elif name == "estimate_kelly":
        w, b, l = inputs["win_rate"], inputs["avg_win"], inputs["avg_loss"]
        kelly = w/l - (1-w)/b  # simplified Kelly
        return json.dumps({"kelly_fraction": round(kelly, 3), "half_kelly": round(kelly/2, 3)})
    return json.dumps({"error": "Unknown tool"})

print("Tool use pattern defined.")
print("Tools available:", [t['name'] for t in tools])
print("\\nExample: compute_sharpe(mean=0.0005, std=0.015)")
result = execute_tool("compute_sharpe", {"mean_return": 0.0005, "std_return": 0.015})
print(f"Result: {result}")""",
                            "exercises": [
                                {
                                    "prompt": "Define 2 tools: `get_price_stats(ticker, period_days)` that returns mock price stats (mean_return, std_return, max_drawdown), and `rank_by_sharpe(tickers)` that computes Sharpe for each and returns them sorted. Build the tool execution loop so Claude can use them to answer 'Which of AAPL, MSFT, GOOGL has the best risk-adjusted return over 252 days?'",
                                    "starter_code": "import anthropic\nimport json\nimport numpy as np\n\nclient = anthropic.Anthropic()\n\ntools = [\n    # Define your tools here\n]\n\ndef execute_tool(name: str, inputs: dict) -> str:\n    # Your implementation here\n    pass\n\ndef run_agent(query: str) -> str:\n    # Agentic loop here\n    pass\n\nprint(run_agent('Which of AAPL, MSFT, GOOGL has the best risk-adjusted return?'))\n",
                                    "hints": ["while True loop: if stop_reason == 'tool_use' → execute → append result → continue", "Use np.random.seed(hash(ticker) % 2**32) for reproducible mock data"]
                                }
                            ]
                        }
                    ]
                },
                # ── A8 ────────────────────────────────────────────────────────
                {
                    "slug": "A8",
                    "title": "AI-Assisted Development",
                    "description": "Use Claude as a coding co-pilot: generate boilerplate, debug errors, refactor code, and build reusable component libraries for AI systems.",
                    "lessons": [
                        {
                            "title": "Prompt Patterns for Code Generation",
                            "duration_min": 20,
                            "concept": "The most productive AI-assisted development follows a consistent pattern: (1) Define the interface first (function signature + docstring), (2) Provide a concrete example of input/output, (3) Specify constraints (performance, dependencies, error handling). This gives the LLM enough context to generate correct, production-ready code.",
                            "why_it_matters": "Developers who use AI effectively are 2-4x more productive. The skill is not in using AI — everyone can do that. The skill is in specifying exactly what you need so the first output is 90% right.",
                            "code_example": """# Effective prompt pattern for code generation
PROMPT_TEMPLATE = \"\"\"
Generate a Python function matching this specification exactly.

FUNCTION SIGNATURE:
def {function_name}({params}) -> {return_type}:

DOCSTRING:
{docstring}

EXAMPLE:
Input: {example_input}
Output: {example_output}

CONSTRAINTS:
{constraints}

Return only the function implementation, no explanation.
\"\"\"

# Example: generating a backtesting utility
spec = {
    "function_name": "rolling_sharpe",
    "params": "returns: pd.Series, window: int = 63",
    "return_type": "pd.Series",
    "docstring": "Compute rolling annualised Sharpe ratio over a given window.",
    "example_input": "returns=pd.Series([0.001, -0.002, 0.003, ...]), window=21",
    "example_output": "pd.Series of Sharpe values with same index, NaN for first (window-1) values",
    "constraints": "- Use numpy for computation, not loops\\n- Handle zero std by returning 0.0\\n- Annualise by multiplying by sqrt(252)"
}

print("Prompt to send to Claude:")
print(PROMPT_TEMPLATE.format(**spec))

# The actual implementation Claude would generate:
import pandas as pd, numpy as np
def rolling_sharpe(returns: pd.Series, window: int = 63) -> pd.Series:
    \"\"\"Compute rolling annualised Sharpe ratio.\"\"\"
    roll_mean = returns.rolling(window).mean()
    roll_std  = returns.rolling(window).std()
    sharpe    = (roll_mean / roll_std.replace(0, np.nan)) * np.sqrt(252)
    return sharpe.fillna(0)

np.random.seed(42)
r = pd.Series(np.random.normal(0.0004, 0.013, 200))
print(f"\\nrolling_sharpe output (last 5):\\n{rolling_sharpe(r).tail()}")""",
                            "exercises": [
                                {
                                    "prompt": "Use the prompt template pattern to specify — then implement — a function `portfolio_metrics(weights, returns_df)` that computes: portfolio return, portfolio vol, Sharpe, max drawdown, and correlation to equal-weight. Return a dict. Write the full specification first as a comment, then implement the function. Test it.",
                                    "starter_code": "import numpy as np\nimport pandas as pd\n\n# SPECIFICATION:\n# Function name:\n# Params:\n# Return type:\n# Example input:\n# Example output:\n# Constraints:\n\n# IMPLEMENTATION:\ndef portfolio_metrics(weights: np.ndarray, returns_df: pd.DataFrame) -> dict:\n    pass\n\n# TEST:\nnp.random.seed(42)\nret = pd.DataFrame(np.random.normal(0.0004, 0.012, (252, 3)), columns=['A','B','C'])\nw = np.array([0.5, 0.3, 0.2])\nprint(portfolio_metrics(w, ret))\n",
                                    "hints": ["port_ret = returns_df @ weights", "EW correlation: np.corrcoef(port_ret, returns_df.mean(axis=1))[0,1]"]
                                }
                            ]
                        }
                    ]
                },
                # ── A9 ────────────────────────────────────────────────────────
                {
                    "slug": "A9",
                    "title": "Real-World Integrations",
                    "description": "Build production AI systems with payment processing, webhook handlers, scheduled jobs, and async task queues.",
                    "lessons": [
                        {
                            "title": "Async Patterns & Background Tasks",
                            "duration_min": 25,
                            "concept": "Production AI systems are async: they trigger long-running jobs (backtests, LLM calls, data ingestion) without blocking the API response. FastAPI background tasks, asyncio, and job queues (like Redis + ARQ) are the tools.",
                            "why_it_matters": "A backtest that takes 30 seconds cannot run synchronously in an HTTP request. An LLM call that times out kills your user experience. Async job patterns are non-negotiable for production AI systems.",
                            "code_example": """import asyncio
import time
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import uuid

app = FastAPI()
jobs: dict = {}  # In production: Redis or a proper queue

class BacktestJob(BaseModel):
    ticker: str
    strategy: str
    start_year: int = 2020

class JobStatus(BaseModel):
    job_id: str
    status: str  # pending | running | complete | failed
    result: Optional[dict] = None
    error: Optional[str] = None

async def run_backtest_async(job_id: str, config: BacktestJob):
    \"\"\"Simulate a long-running backtest job.\"\"\"
    jobs[job_id]["status"] = "running"
    try:
        await asyncio.sleep(2)  # Simulate computation
        import numpy as np
        np.random.seed(42)
        returns = np.random.normal(0.0004, 0.013, 252)
        jobs[job_id] = {
            "status": "complete",
            "result": {
                "sharpe": round(returns.mean() / returns.std() * (252**0.5), 2),
                "ann_return": round(returns.mean() * 252, 4),
            }
        }
    except Exception as e:
        jobs[job_id] = {"status": "failed", "error": str(e)}

@app.post("/backtest/async", response_model=JobStatus)
async def submit_backtest(config: BacktestJob, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())[:8]
    jobs[job_id] = {"status": "pending"}
    background_tasks.add_task(run_backtest_async, job_id, config)
    return JobStatus(job_id=job_id, status="pending")

@app.get("/backtest/{job_id}", response_model=JobStatus)
async def get_job(job_id: str):
    if job_id not in jobs:
        from fastapi import HTTPException
        raise HTTPException(404, "Job not found")
    j = jobs[job_id]
    return JobStatus(job_id=job_id, **j)

print("Async backtest pattern defined")
print("POST /backtest/async → returns job_id immediately")
print("GET /backtest/{job_id} → poll for result")""",
                            "exercises": [
                                {
                                    "prompt": "Build an async research pipeline using asyncio.gather: concurrently fetch mock data for 5 tickers (simulate 0.5s latency each using asyncio.sleep), compute Sharpe for each, and return the results sorted by Sharpe. Measure total time — it should be ~0.5s not ~2.5s.",
                                    "starter_code": "import asyncio\nimport numpy as np\nimport time\n\nasync def fetch_ticker_data(ticker: str) -> dict:\n    \"\"\"Simulate fetching data with 0.5s latency.\"\"\"\n    await asyncio.sleep(0.5)\n    np.random.seed(hash(ticker) % 2**32)\n    returns = np.random.normal(0.0004, 0.013, 252)\n    return {'ticker': ticker, 'returns': returns}\n\nasync def analyse_all(tickers: list[str]) -> list[dict]:\n    # Use asyncio.gather to run concurrently\n    pass\n\nstart = time.time()\nresults = asyncio.run(analyse_all(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA']))\nprint(f'Time: {time.time()-start:.2f}s')\nfor r in results:\n    print(r)\n",
                                    "hints": ["tasks = [fetch_ticker_data(t) for t in tickers]", "results = await asyncio.gather(*tasks)"]
                                }
                            ]
                        }
                    ]
                },
                # ── A10 ───────────────────────────────────────────────────────
                {
                    "slug": "A10",
                    "title": "Capstone: AI-Powered Research System",
                    "description": "Build and deploy a complete AI-powered quant research system: data ingestion, signal generation, backtesting, LLM memo writing, and a REST API — all in one project.",
                    "lessons": [
                        {
                            "title": "End-to-End Research System",
                            "duration_min": 60,
                            "concept": "A production research system has five layers: (1) Data layer (ingestion + storage), (2) Signal layer (strategy logic), (3) Backtest layer (performance simulation), (4) Analysis layer (statistics + regime), (5) Communication layer (LLM memo). Build each layer as a standalone module with a clean interface.",
                            "why_it_matters": "This is the capstone. Everything you have learned — NumPy, Pandas, backtesting, statistics, FastAPI, Claude API — comes together here. The output is a real, deployable system that compounds your research over time.",
                            "code_example": """import numpy as np
import pandas as pd
import json
# Note: In production, import anthropic for memo generation

class QuantResearchSystem:
    \"\"\"End-to-end quant research system.\"\"\"
    def __init__(self, ticker: str = "MOCK"):
        self.ticker = ticker
        self.data: pd.DataFrame = None
        self.signal: pd.Series = None
        self.returns: pd.Series = None
        self.memo: str = ""

    # Layer 1: Data
    def ingest(self, n_days: int = 504) -> "QuantResearchSystem":
        np.random.seed(42)
        idx = pd.date_range("2022-01-01", periods=n_days, freq="B")
        close = 100 * pd.Series(np.cumprod(1 + np.random.normal(0.0004, 0.014, n_days)))
        self.data = pd.DataFrame({"close": close.values}, index=idx)
        return self

    # Layer 2: Signal
    def generate_signal(self, fast=10, slow=40) -> "QuantResearchSystem":
        self.signal = np.sign(
            self.data["close"].rolling(fast).mean() -
            self.data["close"].rolling(slow).mean()
        )
        return self

    # Layer 3: Backtest
    def backtest(self, tc=0.001) -> "QuantResearchSystem":
        ret = self.data["close"].pct_change()
        pos = self.signal.shift(1).fillna(0)
        self.returns = (pos * ret - pos.diff().abs() * tc).dropna()
        return self

    # Layer 4: Analysis
    def analyse(self) -> dict:
        r = self.returns
        cum = (1 + r).cumprod()
        dd  = ((cum - cum.cummax()) / cum.cummax()).min()
        return {
            "sharpe"      : round(r.mean() / r.std() * np.sqrt(252), 2),
            "ann_return"  : round(r.mean() * 252, 4),
            "ann_vol"     : round(r.std() * np.sqrt(252), 4),
            "max_drawdown": round(float(dd), 4),
            "n_days"      : len(r),
        }

    # Layer 5: Communicate
    def write_memo(self, metrics: dict) -> str:
        self.memo = f\"\"\"RESEARCH MEMO — {self.ticker}
{'='*50}
Strategy : MA Crossover (10/40)
Sharpe   : {metrics['sharpe']:.2f}
Return   : {metrics['ann_return']:.2%} ann.
Vol      : {metrics['ann_vol']:.2%} ann.
Drawdown : {metrics['max_drawdown']:.2%} max
Days     : {metrics['n_days']}

KEY INSIGHT: {'Edge detected.' if metrics['sharpe'] > 0.5 else 'Marginal edge — needs refinement.'}
NEXT STEP: Add regime filter to reduce drawdown.
\"\"\"
        return self.memo

# Run the full pipeline
sys = QuantResearchSystem("SPY")
sys.ingest().generate_signal().backtest()
metrics = sys.analyse()
print(sys.write_memo(metrics))""",
                            "exercises": [
                                {
                                    "prompt": "Extend the QuantResearchSystem with a 6th layer: `regime_filter(high_vol_threshold=0.20)` that sets signal to 0 during high-volatility periods (rolling 21-day annualised vol > threshold). Re-run the backtest with the filter applied and compare Sharpe, max drawdown, and number of active days vs the unfiltered version. Write a research memo for both.",
                                    "starter_code": "import numpy as np\nimport pandas as pd\n\n# Copy the QuantResearchSystem class from the example above\n# Then add the regime_filter method\n# Compare filtered vs unfiltered\n",
                                    "hints": ["self.signal[rv > threshold] = 0 where rv = rolling vol", "Run backtest twice: once without filter, once with"]
                                }
                            ]
                        }
                    ]
                },
            ]
        }
    ]
}


def get_module(slug: str) -> dict | None:
    """Return module dict by slug."""
    for track in CURRICULUM["tracks"]:
        for module in track["modules"]:
            if module["slug"] == slug:
                return module
    return None


def get_lesson(module_slug: str, lesson_index: int) -> dict | None:
    """Return lesson dict by module slug and index."""
    module = get_module(module_slug)
    if module is None:
        return None
    lessons = module.get("lessons", [])
    if lesson_index < 0 or lesson_index >= len(lessons):
        return None
    return lessons[lesson_index]
