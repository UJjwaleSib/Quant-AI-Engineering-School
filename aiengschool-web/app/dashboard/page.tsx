"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap, Target, TrendingUp, BookOpen,
  ArrowRight, FlaskConical, Clock, Award,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ProgressRing from "@/components/ProgressRing";
import ModuleCard from "@/components/ModuleCard";
import AIChat from "@/components/AIChat";
import { api } from "@/lib/api";
import type { User, ProgressSummary, Curriculum } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = localStorage.getItem("aes_token");
    if (!token) { router.push("/login"); return; }
    try {
      const [u, p, c] = await Promise.all([
        api.auth.me(),
        api.progress.getSummary(),
        api.curriculum.getAll(),
      ]);
      setUser(u); setProgress(p); setCurriculum(c);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const totalLessons = curriculum?.tracks.flatMap(t => t.modules).reduce((s, m) => s + m.lesson_count, 0) ?? 0;
  const completedTotal = progress?.total_lessons_completed ?? 0;
  const overallPct = totalLessons > 0 ? Math.round((completedTotal / totalLessons) * 100) : 0;

  // Determine "continue" lesson
  const currentMod = progress?.current_module ?? "Q1";
  const currentLesson = progress?.current_lesson ?? 0;

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs text-slate-500 mb-1 font-mono">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {user ? `Welcome back, ${user.display_name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Build real systems. Every module produces artifacts.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: Zap, label: "XP Earned", value: progress?.xp ?? 0, color: "text-amber-400", bg: "bg-amber-500/10" },
            { icon: Target, label: "Lessons Done", value: completedTotal, color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { icon: TrendingUp, label: "Streak", value: `${progress?.streak_days ?? 0}d`, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { icon: BookOpen, label: "Total Lessons", value: totalLessons, color: "text-violet-400", bg: "bg-violet-500/10" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-[#1a1d27] border border-[#2e3245] rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Overall progress */}
          <div className="bg-[#1a1d27] border border-[#2e3245] rounded-xl p-6 flex flex-col items-center justify-center gap-4">
            <ProgressRing
              value={overallPct}
              size={110}
              strokeWidth={9}
              label={`${overallPct}%`}
              sublabel="complete"
            />
            <div className="text-center">
              <div className="text-sm font-semibold text-white">Overall Progress</div>
              <div className="text-xs text-slate-500 mt-0.5">{completedTotal} of {totalLessons} lessons</div>
            </div>
          </div>

          {/* Continue learning */}
          <div className="col-span-2 bg-[#1a1d27] border border-[#2e3245] rounded-xl p-6">
            <div className="text-xs text-slate-500 font-medium mb-4 uppercase tracking-wider">Continue Learning</div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white mb-1">
                  Module {currentMod} · Lesson {currentLesson + 1}
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Pick up where you left off. Every lesson ends with a real exercise.
                </p>
                <Link
                  href={`/modules/${currentMod}/${currentLesson}`}
                  className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: FlaskConical, label: "Research Logs", desc: "View your auto-generated research memos", href: "/research-logs", color: "text-amber-400", bg: "bg-amber-500/10" },
            { icon: Clock, label: "Playground", desc: "Run Python experiments in the browser", href: "/playground", color: "text-cyan-400", bg: "bg-cyan-500/10" },
            { icon: Award, label: "All Modules", desc: "Browse Track 1 Quant + Track 2 AI", href: "/modules", color: "text-violet-400", bg: "bg-violet-500/10" },
          ].map(({ icon: Icon, label, desc, href, color, bg }) => (
            <Link key={href} href={href} className="bg-[#1a1d27] border border-[#2e3245] rounded-xl p-5 hover:border-slate-600 transition-all group">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
              <div className="font-semibold text-sm text-white mb-1">{label}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
              <div className={`flex items-center gap-1 text-xs mt-3 ${color} group-hover:gap-2 transition-all`}>
                Open <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>

        {/* Track overview */}
        {curriculum && (
          <div>
            <div className="text-xs text-slate-500 font-medium mb-4 uppercase tracking-wider">Curriculum Tracks</div>
            <div className="grid grid-cols-2 gap-6">
              {curriculum.tracks.map((track, ti) => (
                <div key={track.name} className="bg-[#1a1d27] border border-[#2e3245] rounded-xl p-5">
                  <div className={`text-xs font-bold mb-4 ${ti === 0 ? "text-emerald-400" : "text-indigo-400"}`}>
                    {track.name}
                  </div>
                  <div className="space-y-2">
                    {track.modules.slice(0, 4).map((mod) => {
                      const done = progress?.by_module[mod.slug] ?? 0;
                      const pct = mod.lesson_count > 0 ? Math.round((done / mod.lesson_count) * 100) : 0;
                      return (
                        <Link
                          key={mod.slug}
                          href={`/modules/${mod.slug}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#242736] transition-colors group"
                        >
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${ti === 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"}`}>
                            {mod.slug}
                          </span>
                          <span className="text-xs text-slate-400 flex-1 truncate group-hover:text-white transition-colors">
                            {mod.title}
                          </span>
                          <span className="text-[10px] text-slate-600">{pct}%</span>
                        </Link>
                      );
                    })}
                    {track.modules.length > 4 && (
                      <div className="text-[10px] text-slate-600 pl-2">+{track.modules.length - 4} more</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <AIChat />
    </div>
  );
}
