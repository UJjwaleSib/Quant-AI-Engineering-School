"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronUp,
  Lightbulb, Zap, BookOpen, Code2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Sidebar from "@/components/Sidebar";
import AIChat from "@/components/AIChat";
import ExerciseEngine from "@/components/ExerciseEngine";
import { api } from "@/lib/api";
import type { Lesson } from "@/lib/types";

export default function LessonPage() {
  const { slug, lesson } = useParams<{ slug: string; lesson: string }>();
  const lessonIndex = parseInt(lesson);
  const router = useRouter();

  const [data, setData] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWhy, setShowWhy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<"concept" | "exercise">("concept");
  const startTime = useRef(Date.now());

  const load = useCallback(async () => {
    const token = localStorage.getItem("aes_token");
    if (!token) { router.push("/login"); return; }
    try {
      const lesson = await api.curriculum.getLesson(slug, lessonIndex);
      setData(lesson);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("401") || msg.includes("credentials") || msg.includes("Unauthorized")) {
        localStorage.removeItem("aes_token");
        router.push("/login");
      }
    } finally { setLoading(false); }
  }, [slug, lessonIndex, router]);

  useEffect(() => { load(); }, [load]);

  async function handleComplete() {
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    try {
      await api.progress.completeLesson(slug, lessonIndex, elapsed);
      setCompleted(true);
    } catch { /* non-fatal */ }
  }

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
      <main className="ml-56 flex-1 flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-[#0f1117]/90 backdrop-blur border-b border-[#2e3245] px-8 py-3 flex items-center gap-4">
          <Link href={`/modules/${slug}`} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> {slug}
          </Link>
          <div className="flex-1 text-sm font-medium text-white truncate">{data?.title}</div>
          <div className="flex items-center gap-2">
            {/* Tabs */}
            {(["concept", "exercise"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab
                    ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab === "concept" ? <BookOpen className="w-3 h-3" /> : <Code2 className="w-3 h-3" />}
                {tab === "concept" ? "Concept" : "Exercise"}
              </button>
            ))}
          </div>
          <Link
            href={`/modules/${slug}/${lessonIndex + 1}`}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Next <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "concept" && data && (
            <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">
              {/* Concept */}
              <div className="bg-[#1a1d27] border border-[#2e3245] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Concept</span>
                </div>
                <p className="text-sm text-slate-300 leading-7">{data.concept}</p>
              </div>

              {/* Why it matters */}
              <button
                onClick={() => setShowWhy(!showWhy)}
                className="w-full flex items-center gap-3 bg-[#1a1d27] border border-amber-500/20 rounded-xl px-5 py-4 hover:bg-[#242736]/50 transition-all"
              >
                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-sm font-medium text-amber-300 flex-1 text-left">Why This Matters (Quant Angle)</span>
                {showWhy ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              {showWhy && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-5 py-4 -mt-3">
                  <p className="text-sm text-slate-300 leading-7">{data.why_it_matters}</p>
                </div>
              )}

              {/* Code example */}
              <div className="bg-[#1a1d27] border border-[#2e3245] rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-[#2e3245] flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Code Example</span>
                </div>
                <pre className="p-5 overflow-x-auto text-xs leading-6 text-slate-300 font-mono">
                  {data.code_example}
                </pre>
              </div>

              {/* Complete + continue */}
              <div className="flex items-center gap-4 pt-2">
                {!completed ? (
                  <button
                    onClick={handleComplete}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Complete
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Completed! +50 XP
                  </div>
                )}
                <button
                  onClick={() => setActiveTab("exercise")}
                  className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                >
                  <Zap className="w-4 h-4" /> Try the Exercise
                </button>
              </div>
            </div>
          )}

          {activeTab === "exercise" && data && (
            <div className="max-w-5xl mx-auto px-8 py-8">
              <ExerciseEngine
                exercises={data.exercises}
                moduleSlug={slug}
                lessonIndex={lessonIndex}
                lessonTitle={data.title}
              />
            </div>
          )}
        </div>
      </main>
      <AIChat moduleSlug={slug} lessonTitle={data?.title ?? ""} />
    </div>
  );
}
