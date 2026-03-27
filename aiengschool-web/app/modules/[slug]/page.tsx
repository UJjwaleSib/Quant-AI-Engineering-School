"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, ChevronRight, Play } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import AIChat from "@/components/AIChat";
import { api } from "@/lib/api";
import type { Module, LessonProgress } from "@/lib/types";

export default function ModuleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [module, setModule] = useState<Module | null>(null);
  const [allProgress, setAllProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = localStorage.getItem("aes_token");
    if (!token) { router.push("/login"); return; }
    try {
      const [m, p] = await Promise.all([
        api.curriculum.getModule(slug),
        api.progress.getAll(),
      ]);
      setModule(m); setAllProgress(p);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("401") || msg.includes("credentials") || msg.includes("Unauthorized")) {
        localStorage.removeItem("aes_token");
        router.push("/login");
      }
    } finally { setLoading(false); }
  }, [slug, router]);

  useEffect(() => { load(); }, [load]);

  const isCompleted = (lessonIndex: number) =>
    allProgress.some(p => p.module_slug === slug && p.lesson_index === lessonIndex && p.completed);

  if (loading) return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar />
      <main className="ml-56 flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </main>
    </div>
  );

  const completedCount = module?.lessons.filter((_, i) => isCompleted(i)).length ?? 0;

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar />
      <main className="ml-56 flex-1 p-8 max-w-4xl">
        {/* Back */}
        <Link href="/modules" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> All Modules
        </Link>

        {/* Header */}
        <div className="bg-[#1a1d27] border border-[#2e3245] rounded-2xl p-7 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs font-bold text-indigo-400">
              {slug}
            </div>
            <div className="text-xs text-slate-500">{completedCount}/{module?.lesson_count ?? 0} completed</div>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">{module?.title}</h1>
          <p className="text-sm text-slate-400 leading-relaxed">{module?.description}</p>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="h-1.5 bg-[#2e3245] rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${module?.lesson_count ? (completedCount / module.lesson_count) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lessons list */}
        <div className="space-y-2">
          {module?.lessons.map((lesson, i) => {
            const done = isCompleted(i);
            const isNext = !done && (i === 0 || isCompleted(i - 1));
            return (
              <Link
                key={i}
                href={`/modules/${slug}/${i}`}
                className="flex items-center gap-4 bg-[#1a1d27] border border-[#2e3245] rounded-xl px-5 py-4 hover:border-indigo-500/40 hover:bg-[#242736]/50 transition-all group"
              >
                {/* Status icon */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done ? "bg-emerald-500/10" : isNext ? "bg-indigo-500/10" : "bg-[#2e3245]"
                }`}>
                  {done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="text-xs font-bold text-slate-500">{i + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{lesson.title}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Clock className="w-2.5 h-2.5" /> {lesson.duration_min} min
                    </span>
                    {isNext && <span className="text-[10px] text-indigo-400 font-medium">← Next up</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isNext && (
                    <div className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      <Play className="w-2.5 h-2.5 fill-current" /> Start
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <AIChat moduleSlug={slug} />
    </div>
  );
}
