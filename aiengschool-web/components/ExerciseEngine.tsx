"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Play, Loader2, CheckCircle2, XCircle, Lightbulb,
  ChevronLeft, ChevronRight, Zap, RefreshCw, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Exercise, ExerciseFeedback } from "@/lib/types";
import clsx from "clsx";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Props {
  exercises: Exercise[];
  moduleSlug: string;
  lessonIndex: number;
  lessonTitle: string;
}

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

async function runPython(code: string): Promise<string> {
  try {
    const res = await fetch(PISTON_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "python",
        version: "3.10.0",
        files: [{ name: "main.py", content: code }],
        stdin: "",
        args: [],
        run_timeout: 10000,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      }),
    });
    const data = await res.json();
    const out = data.run?.output ?? "";
    const err = data.run?.stderr ?? "";
    return (out + (err ? "\n[stderr]\n" + err : "")).trim().slice(0, 4000);
  } catch (e) {
    return `[Execution error: ${e instanceof Error ? e.message : "unknown"}]`;
  }
}

export default function ExerciseEngine({ exercises, moduleSlug, lessonIndex, lessonTitle }: Props) {
  const [idx, setIdx] = useState(0);
  const [code, setCode] = useState(exercises[0]?.starter_code ?? "");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const currentExercise = exercises[idx];

  const switchExercise = useCallback((newIdx: number) => {
    setIdx(newIdx);
    setCode(exercises[newIdx]?.starter_code ?? "");
    setOutput("");
    setFeedback(null);
    setShowHints(false);
    setShowOutput(false);
  }, [exercises]);

  async function runCode() {
    if (!code.trim()) return;
    setRunning(true);
    setShowOutput(true);
    setOutput("Running...");
    const result = await runPython(code);
    setOutput(result);
    setRunning(false);
  }

  async function submitCode() {
    if (!code.trim()) return;
    setSubmitting(true);
    // Run first to get output
    const execOutput = output || await runPython(code);
    if (!output) setOutput(execOutput);
    try {
      const fb = await api.exercises.submit({
        module_slug: moduleSlug,
        lesson_index: lessonIndex,
        exercise_index: idx,
        user_code: code,
        execution_output: execOutput,
      });
      setFeedback(fb);
      if (fb.passed) {
        toast.success(`✓ Passed! +30 XP — Research log auto-generated`, { duration: 4000 });
      } else {
        toast.error(`Score: ${fb.score}/100 — Check the feedback below`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Exercise selector */}
      {exercises.length > 1 && (
        <div className="flex items-center gap-2">
          {exercises.map((_, i) => (
            <button
              key={i}
              onClick={() => switchExercise(i)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                i === idx
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  : "text-slate-500 hover:text-slate-300 border border-[#2e3245]"
              )}
            >
              Exercise {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Prompt */}
      <div className="bg-[#1a1d27] border border-[#2e3245] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Exercise {idx + 1}</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{currentExercise?.prompt}</p>

        {/* Hints */}
        {currentExercise?.hints.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Lightbulb className="w-3 h-3" />
              {showHints ? "Hide" : "Show"} hints ({currentExercise.hints.length})
            </button>
            {showHints && (
              <ul className="mt-2 space-y-1">
                {currentExercise.hints.map((h, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">→</span> {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="bg-[#1a1d27] border border-[#2e3245] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2e3245]">
          <span className="text-xs text-slate-500 font-mono">main.py</span>
          <div className="flex gap-2">
            <button
              onClick={() => setCode(currentExercise?.starter_code ?? "")}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors px-2 py-1 rounded"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
            <button
              onClick={runCode}
              disabled={running}
              className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            >
              {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
              Run
            </button>
            <button
              onClick={submitCode}
              disabled={submitting}
              className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
              Submit for AI Feedback
            </button>
          </div>
        </div>
        <MonacoEditor
          height="320px"
          language="python"
          value={code}
          onChange={(v) => setCode(v ?? "")}
          theme="vs-dark"
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            renderLineHighlight: "gutter",
            scrollbar: { verticalScrollbarSize: 6 },
            overviewRulerLanes: 0,
          }}
        />
      </div>

      {/* Output */}
      {showOutput && (
        <div className="bg-[#0a0d14] border border-[#2e3245] rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-[#2e3245] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-500 font-mono">output</span>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-300 leading-5 overflow-x-auto max-h-48">
            {running ? "Running…" : output || "(no output)"}
          </pre>
        </div>
      )}

      {/* AI Feedback */}
      {feedback && (
        <div className={`border rounded-xl p-5 ${feedback.passed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
          <div className="flex items-center gap-2 mb-3">
            {feedback.passed
              ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              : <XCircle className="w-4 h-4 text-red-400" />}
            <span className={`text-xs font-bold uppercase tracking-wider ${feedback.passed ? "text-emerald-400" : "text-red-400"}`}>
              AI Feedback · Score: {feedback.score}/100
            </span>
          </div>

          <p className="text-sm text-slate-300 mb-4 leading-relaxed">{feedback.feedback}</p>

          {feedback.hint && (
            <div className="flex items-start gap-2 mb-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-300">{feedback.hint}</p>
            </div>
          )}

          {feedback.improvement && (
            <div className="flex items-start gap-2 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-indigo-300 font-mono">{feedback.improvement}</p>
            </div>
          )}

          {feedback.passed && (
            <div className="mt-4 pt-4 border-t border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
              Research log auto-generated and saved to your Research Logs.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
