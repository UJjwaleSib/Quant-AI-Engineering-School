"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, FlaskConical, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import ResearchLogCard from "@/components/ResearchLogCard";
import AIChat from "@/components/AIChat";
import { api } from "@/lib/api";
import type { ResearchLog } from "@/lib/types";

export default function ResearchLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ResearchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "", module_slug: "Q1", hypothesis: "",
    method: "", results: "", key_insight: "", next_step: "", tags: "",
  });

  const load = useCallback(async () => {
    const token = localStorage.getItem("aes_token");
    if (!token) { router.push("/login"); return; }
    try {
      setLogs(await api.researchLogs.getAll());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("401") || msg.includes("credentials") || msg.includes("Unauthorized")) {
        localStorage.removeItem("aes_token");
        router.push("/login");
      }
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: number) {
    try {
      await api.researchLogs.delete(id);
      setLogs(l => l.filter(x => x.id !== id));
      toast.success("Log deleted");
    } catch { toast.error("Failed to delete"); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const log = await api.researchLogs.create({
        ...form,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      });
      setLogs(l => [log, ...l]);
      setShowCreate(false);
      setForm({ title: "", module_slug: "Q1", hypothesis: "", method: "", results: "", key_insight: "", next_step: "", tags: "" });
      toast.success("Research log created");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setCreating(false); }
  }

  const filtered = logs.filter(l => {
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.hypothesis.toLowerCase().includes(search.toLowerCase()) ||
      l.key_insight.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || l.module_slug === filter;
    return matchSearch && matchFilter;
  });

  const modules = [...new Set(logs.map(l => l.module_slug))].sort();

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Research Logs</h1>
            <p className="text-slate-500 text-sm mt-1">
              Auto-generated after every passed exercise. Your compounding knowledge base.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> New Log
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="bg-[#1a1d27] border border-indigo-500/20 rounded-2xl p-6 mb-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-5">
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">New Research Log</span>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Title *</label>
                  <input
                    required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Momentum Signal on SPY 2022–2024"
                    className="w-full bg-[#0f1117] border border-[#2e3245] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Module</label>
                  <select
                    value={form.module_slug} onChange={e => setForm(f => ({ ...f, module_slug: e.target.value }))}
                    className="w-full bg-[#0f1117] border border-[#2e3245] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {["Q1","Q2","Q3","Q4","Q5","Q6","A1","A2","A3","A4","A5","A6","A7","A8","A9","A10"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              {[
                { key: "hypothesis", label: "Hypothesis", placeholder: "What were you testing?" },
                { key: "method", label: "Method", placeholder: "What technique did you use?" },
                { key: "results", label: "Results", placeholder: "What did you find?" },
                { key: "key_insight", label: "Key Insight", placeholder: "Most important takeaway for a quant practitioner" },
                { key: "next_step", label: "Next Step", placeholder: "What should you investigate next?" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-slate-500 mb-1 block">{label}</label>
                  <textarea
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    rows={2}
                    className="w-full bg-[#0f1117] border border-[#2e3245] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Tags (comma-separated)</label>
                <input
                  value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="momentum, equities, sharpe"
                  className="w-full bg-[#0f1117] border border-[#2e3245] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={creating}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50">
                  {creating ? "Creating…" : "Save Log"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  className="text-slate-500 hover:text-slate-300 text-sm px-4 py-2 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search + filter */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search logs…"
              className="w-full bg-[#1a1d27] border border-[#2e3245] rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <select
            value={filter} onChange={e => setFilter(e.target.value)}
            className="bg-[#1a1d27] border border-[#2e3245] rounded-lg px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">All modules</option>
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Logs", value: logs.length },
            { label: "This Week", value: logs.filter(l => new Date(l.created_at) > new Date(Date.now() - 7*86400000)).length },
            { label: "Modules Covered", value: modules.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#1a1d27] border border-[#2e3245] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">{label}</span>
              <span className="text-lg font-bold text-white">{value}</span>
            </div>
          ))}
        </div>

        {/* Logs */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FlaskConical className="w-10 h-10 text-slate-700 mb-4" />
            <div className="text-slate-400 font-medium mb-1">
              {logs.length === 0 ? "No research logs yet" : "No logs match your search"}
            </div>
            <p className="text-slate-600 text-sm max-w-xs">
              {logs.length === 0
                ? "Complete an exercise and pass it — a log will be auto-generated by AI."
                : "Try a different search term or filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(log => (
              <ResearchLogCard key={log.id} log={log} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
      <AIChat />
    </div>
  );
}
