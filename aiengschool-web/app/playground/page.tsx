"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Play, Loader2, RefreshCw, Copy, Trash2,
  BookOpen, Zap, Terminal, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import AIChat from "@/components/AIChat";
import clsx from "clsx";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

const SNIPPETS: Record<string, { label: string; code: string }> = {
  blank: { label: "Blank", code: "# Write your Python here\nprint('Hello, quant world!')\n" },
  sharpe: {
    label: "Sharpe Ratio",
    code: `import numpy as np

np.random.seed(42)
returns = np.random.normal(0.0005, 0.015, 252)

sharpe = returns.mean() / returns.std() * np.sqrt(252)
ann_ret = returns.mean() * 252
ann_vol = returns.std() * np.sqrt(252)

print(f"Ann. Return : {ann_ret:.2%}")
print(f"Ann. Vol    : {ann_vol:.2%}")
print(f"Sharpe Ratio: {sharpe:.2f}")
`,
  },
  drawdown: {
    label: "Max Drawdown",
    code: `import numpy as np

np.random.seed(7)
returns = np.random.normal(0.0003, 0.014, 500)
prices = np.cumprod(1 + returns)

# Rolling peak
peak = np.maximum.accumulate(prices)
drawdown = (prices - peak) / peak
max_dd = drawdown.min()

print(f"Max Drawdown: {max_dd:.2%}")
print(f"Worst day   : index {np.argmin(drawdown)}")
`,
  },
  momentum: {
    label: "Momentum Signal",
    code: `import numpy as np
import pandas as pd

np.random.seed(42)
prices = pd.Series(100 * np.cumprod(1 + np.random.normal(0.0004, 0.013, 500)))

# 20-day momentum signal
signal = np.sign(prices.pct_change(20))
ret = (signal.shift(1) * prices.pct_change()).dropna()

sharpe = ret.mean() / ret.std() * np.sqrt(252)
print(f"Momentum Sharpe: {sharpe:.2f}")
print(f"Win rate       : {(ret > 0).mean():.1%}")
print(f"Ann. Return    : {ret.mean()*252:.2%}")
`,
  },
  montecarlo: {
    label: "Monte Carlo",
    code: `import numpy as np

np.random.seed(42)
hist = np.random.normal(0.0005, 0.015, 252)

def simulate(returns, n=1000, periods=252):
    paths = np.zeros((n, periods))
    for i in range(n):
        s = np.random.choice(returns, size=periods, replace=True)
        paths[i] = np.cumprod(1 + s)
    return paths

paths = simulate(hist)
finals = paths[:, -1]
dds = [(p - np.maximum.accumulate(p)).min() / np.maximum.accumulate(p).max() for p in paths]

print(f"Median final value : {np.median(finals):.3f}")
print(f"5th pct final      : {np.percentile(finals, 5):.3f}")
print(f"P(loss)            : {(finals < 1).mean():.1%}")
print(f"Median max DD      : {np.median(dds):.2%}")
print(f"P(DD > 20%)        : {(np.array(dds) < -0.20).mean():.1%}")
`,
  },
  kelly: {
    label: "Kelly Criterion",
    code: `import numpy as np

np.random.seed(42)
returns = np.random.normal(0.0006, 0.014, 252)

# Continuous Kelly: f* = mu / sigma^2
mu = returns.mean()
sigma2 = returns.var()
kelly = mu / sigma2
print(f"Full Kelly leverage: {kelly:.2f}x")
print(f"Half Kelly         : {kelly/2:.2f}x")

# Simulate full vs half Kelly
def sim(lev, returns):
    port = np.cumprod(1 + lev * returns)
    dd = ((port - np.maximum.accumulate(port)) / np.maximum.accumulate(port)).min()
    return port[-1], dd

fk_val, fk_dd = sim(kelly, returns)
hk_val, hk_dd = sim(kelly/2, returns)
print(f"\\nFull Kelly - final: {fk_val:.3f}, max DD: {fk_dd:.2%}")
print(f"Half Kelly - final: {hk_val:.3f}, max DD: {hk_dd:.2%}")
`,
  },
  portfolio: {
    label: "Portfolio Optimisation",
    code: `import numpy as np

np.random.seed(42)
n = 4
# Correlated return matrix
L = np.linalg.cholesky(np.array([
    [1.00, 0.30, 0.20, 0.10],
    [0.30, 1.00, 0.40, 0.15],
    [0.20, 0.40, 1.00, 0.25],
    [0.10, 0.15, 0.25, 1.00],
]))
raw = np.random.normal(0, 1, (252, n)) @ L.T * 0.013
mu  = raw.mean(axis=0) * 252
cov = np.cov(raw.T) * 252

# Equal weight
ew = np.ones(n) / n
ew_sharpe = (ew @ mu) / np.sqrt(ew @ cov @ ew)

# Risk parity (inverse vol)
vols = np.sqrt(np.diag(cov))
rp = (1/vols) / (1/vols).sum()
rp_sharpe = (rp @ mu) / np.sqrt(rp @ cov @ rp)

# Kelly (unconstrained)
kelly_w = np.linalg.inv(cov) @ mu
kelly_w /= kelly_w.sum()
kelly_sharpe = (kelly_w @ mu) / np.sqrt(kelly_w @ cov @ kelly_w)

print("Portfolio Sharpe Comparison:")
print(f"  Equal Weight : {ew_sharpe:.2f}")
print(f"  Risk Parity  : {rp_sharpe:.2f}")
print(f"  Kelly        : {kelly_sharpe:.2f}")
`,
  },
};

async function runPython(code: string): Promise<string> {
  try {
    const res = await fetch(PISTON_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "python", version: "3.10.0",
        files: [{ name: "main.py", content: code }],
        stdin: "", args: [], run_timeout: 15000,
        compile_memory_limit: -1, run_memory_limit: -1,
      }),
    });
    const d = await res.json();
    const out = d.run?.output ?? "";
    const err = d.run?.stderr ?? "";
    return (out + (err ? "\n[stderr]\n" + err : "")).trim().slice(0, 8000);
  } catch (e) {
    return `[Execution error: ${e instanceof Error ? e.message : "unknown"}]`;
  }
}

export default function PlaygroundPage() {
  const router = useRouter();
  const [code, setCode] = useState(SNIPPETS.blank.code);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [snippet, setSnippet] = useState("blank");
  const [showSnippets, setShowSnippets] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("aes_token")) router.push("/login");
  }, [router]);

  async function run() {
    if (!code.trim() || running) return;
    setRunning(true);
    setOutput("Running…");
    const result = await runPython(code);
    setOutput(result);
    setRunning(false);
  }

  function loadSnippet(key: string) {
    setSnippet(key);
    setCode(SNIPPETS[key].code);
    setOutput("");
    setShowSnippets(false);
  }

  function copyOutput() {
    if (output) { navigator.clipboard.writeText(output); toast.success("Copied"); }
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar />
      <main className="ml-56 flex-1 flex flex-col h-screen">
        {/* Top bar */}
        <div className="px-6 py-3 border-b border-[#2e3245] flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Python Playground</span>
          </div>

          {/* Snippets dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSnippets(!showSnippets)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-[#1a1d27] border border-[#2e3245] px-3 py-1.5 rounded-lg transition-colors"
            >
              <BookOpen className="w-3 h-3" />
              {SNIPPETS[snippet].label}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showSnippets && (
              <div className="absolute top-full left-0 mt-1 bg-[#1a1d27] border border-[#2e3245] rounded-xl overflow-hidden shadow-xl z-50 w-48">
                {Object.entries(SNIPPETS).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => loadSnippet(key)}
                    className={clsx(
                      "w-full text-left px-4 py-2.5 text-xs transition-colors",
                      key === snippet ? "bg-indigo-500/10 text-indigo-300" : "text-slate-400 hover:bg-[#242736] hover:text-slate-200"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <button onClick={() => { setCode(""); setOutput(""); }} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-[#1a1d27]">
            <Trash2 className="w-3 h-3" /> Clear
          </button>
          <button
            onClick={run}
            disabled={running}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium px-4 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            Run
          </button>
          <div className="text-[10px] text-slate-600 bg-[#1a1d27] border border-[#2e3245] px-2 py-1 rounded font-mono">
            Python 3.10 · Piston
          </div>
        </div>

        {/* Editor + output split */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className="flex-1 flex flex-col border-r border-[#2e3245]">
            <MonacoEditor
              height="100%"
              language="python"
              value={code}
              onChange={(v) => setCode(v ?? "")}
              theme="vs-dark"
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                renderLineHighlight: "gutter",
                scrollbar: { verticalScrollbarSize: 6 },
                overviewRulerLanes: 0,
                wordWrap: "on",
              }}
            />
          </div>

          {/* Output panel */}
          <div className="w-96 flex flex-col bg-[#0a0d14]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2e3245]">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${running ? "bg-amber-400 animate-pulse" : output ? "bg-emerald-500" : "bg-slate-600"}`} />
                <span className="text-xs text-slate-500 font-mono">output</span>
              </div>
              <div className="flex gap-2">
                <button onClick={copyOutput} disabled={!output} className="text-slate-600 hover:text-slate-400 transition-colors disabled:opacity-30">
                  <Copy className="w-3 h-3" />
                </button>
                <button onClick={() => setOutput("")} disabled={!output} className="text-slate-600 hover:text-slate-400 transition-colors disabled:opacity-30">
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {output ? (
                <pre className="text-xs font-mono text-emerald-300 leading-5 whitespace-pre-wrap break-words">
                  {output}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <Zap className="w-6 h-6 text-slate-700" />
                  <p className="text-xs text-slate-600">Run your code to see output here</p>
                  <p className="text-[10px] text-slate-700">Ctrl+Enter to run</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <AIChat userCode={code} />
    </div>
  );
}
