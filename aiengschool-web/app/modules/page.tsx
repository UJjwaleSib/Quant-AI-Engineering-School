"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ModuleCard from "@/components/ModuleCard";
import AIChat from "@/components/AIChat";
import { api } from "@/lib/api";
import type { Curriculum, ProgressSummary } from "@/lib/types";

export default function ModulesPage() {
  const router = useRouter();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = localStorage.getItem("aes_token");
    if (!token) { router.push("/login"); return; }
    try {
      const [c, p] = await Promise.all([api.curriculum.getAll(), api.progress.getSummary()]);
      setCurriculum(c); setProgress(p);
    } catch { router.push("/login"); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar />
      <main className="ml-56 flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Curriculum</h1>
          <p className="text-slate-500 text-sm mt-1">Two tracks. Every module produces real artifacts.</p>
        </div>

        {curriculum?.tracks.map((track, ti) => (
          <div key={track.name} className="mb-10">
            <div className={`flex items-center gap-3 mb-5`}>
              <div className={`h-px flex-1 ${ti === 0 ? "bg-emerald-500/20" : "bg-indigo-500/20"}`} />
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                ti === 0
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              }`}>
                {track.name}
              </span>
              <div className={`h-px flex-1 ${ti === 0 ? "bg-emerald-500/20" : "bg-indigo-500/20"}`} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {track.modules.map((mod, mi) => (
                <ModuleCard
                  key={mod.slug}
                  module={mod}
                  completedLessons={progress?.by_module[mod.slug] ?? 0}
                  track={ti === 0 ? "quant" : "ai"}
                  locked={false}
                />
              ))}
            </div>
          </div>
        ))}
      </main>
      <AIChat />
    </div>
  );
}
