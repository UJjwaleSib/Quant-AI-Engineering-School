"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, BookOpen, Video, Github, FileText, Star } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import AIChat from "@/components/AIChat";

const RESOURCES = [
  {
    category: "Quant Research",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    items: [
      { title: "Advances in Financial Machine Learning", author: "Marcos López de Prado", type: "book", url: "https://www.amazon.com/Advances-Financial-Machine-Learning-Marcos/dp/1119482089", starred: true },
      { title: "Quantitative Trading", author: "Ernest Chan", type: "book", url: "https://www.amazon.com/Quantitative-Trading-Build-Algorithmic-Business/dp/0470284889", starred: true },
      { title: "Active Portfolio Management", author: "Grinold & Kahn", type: "book", url: "https://www.amazon.com/Active-Portfolio-Management-Quantitative-Controlling/dp/0070248826" },
      { title: "QuantLib Python Cookbook", author: "Luigi Ballabio", type: "book", url: "https://quantlib-python-cookbook.readthedocs.io/" },
      { title: "Backtrader Docs", author: "backtrader.com", type: "docs", url: "https://www.backtrader.com/docu/" },
      { title: "Zipline-Reloaded", author: "Stefan Jansen", type: "github", url: "https://github.com/stefan-jansen/zipline-reloaded" },
    ],
  },
  {
    category: "AI Engineering",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    items: [
      { title: "Anthropic Docs", author: "Claude API Reference", type: "docs", url: "https://docs.anthropic.com", starred: true },
      { title: "FastAPI Documentation", author: "Sebastián Ramírez", type: "docs", url: "https://fastapi.tiangolo.com", starred: true },
      { title: "Building LLM-Powered Apps", author: "Chip Huyen", type: "article", url: "https://huyenchip.com/2023/04/11/llm-engineering.html" },
      { title: "Practical LLMs", author: "Eugene Yan", type: "article", url: "https://eugeneyan.com/tag/llm/" },
      { title: "SQLAlchemy 2.0 Docs", author: "Mike Bayer", type: "docs", url: "https://docs.sqlalchemy.org/en/20/" },
      { title: "Next.js App Router", author: "Vercel", type: "docs", url: "https://nextjs.org/docs/app" },
    ],
  },
  {
    category: "Python & Data Science",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    items: [
      { title: "NumPy User Guide", author: "NumPy Team", type: "docs", url: "https://numpy.org/doc/stable/user/" },
      { title: "Pandas Documentation", author: "PyData", type: "docs", url: "https://pandas.pydata.org/docs/" },
      { title: "Python for Data Analysis", author: "Wes McKinney", type: "book", url: "https://wesmckinney.com/book/", starred: true },
      { title: "SciPy Stats Reference", author: "SciPy Team", type: "docs", url: "https://docs.scipy.org/doc/scipy/reference/stats.html" },
      { title: "yfinance GitHub", author: "Ran Aroussi", type: "github", url: "https://github.com/ranaroussi/yfinance" },
      { title: "Statsmodels Docs", author: "statsmodels.org", type: "docs", url: "https://www.statsmodels.org/stable/index.html" },
    ],
  },
  {
    category: "Market Data & Tools",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    items: [
      { title: "Yahoo Finance API", author: "Free market data", type: "docs", url: "https://finance.yahoo.com" },
      { title: "FRED Economic Data", author: "Federal Reserve", type: "docs", url: "https://fred.stlouisfed.org", starred: true },
      { title: "Quandl / Nasdaq Data Link", author: "Nasdaq", type: "docs", url: "https://data.nasdaq.com" },
      { title: "Alpha Vantage", author: "Free API key", type: "docs", url: "https://www.alphavantage.co" },
      { title: "OpenBB Platform", author: "OpenBB Team", type: "github", url: "https://github.com/OpenBB-finance/OpenBBTerminal" },
      { title: "Piston API", author: "Code execution sandbox", type: "docs", url: "https://github.com/engineer-man/piston" },
    ],
  },
];

const TYPE_ICONS: Record<string, typeof BookOpen> = {
  book: BookOpen, video: Video, github: Github,
  docs: FileText, article: FileText,
};

export default function ResourcesPage() {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem("aes_token")) router.push("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Resource Library</h1>
          <p className="text-slate-500 text-sm mt-1">Curated references for every module. No filler.</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {RESOURCES.map((section) => {
            const Icon = section.color.includes("emerald") ? BookOpen : section.color.includes("indigo") ? FileText : section.color.includes("amber") ? BookOpen : FileText;
            return (
              <div key={section.category} className={`bg-[#1a1d27] border border-[#2e3245] rounded-2xl overflow-hidden`}>
                <div className={`px-5 py-4 border-b border-[#2e3245] flex items-center gap-2`}>
                  <div className={`w-7 h-7 rounded-lg ${section.bg} border ${section.border} flex items-center justify-center`}>
                    <BookOpen className={`w-3.5 h-3.5 ${section.color}`} />
                  </div>
                  <span className={`text-sm font-semibold ${section.color}`}>{section.category}</span>
                </div>
                <div className="divide-y divide-[#2e3245]">
                  {section.items.map((item) => {
                    const ItemIcon = TYPE_ICONS[item.type] ?? FileText;
                    return (
                      <a
                        key={item.title}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#242736] transition-colors group"
                      >
                        <ItemIcon className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0 group-hover:text-slate-400 transition-colors" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors truncate">{item.title}</span>
                            {item.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">{item.author}</div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-700 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-0.5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <AIChat />
    </div>
  );
}
