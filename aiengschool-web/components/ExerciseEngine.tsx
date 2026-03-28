"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Play, Loader2, CheckCircle2, XCircle, Lightbulb,
  Zap, RefreshCw, TrendingUp, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Exercise, ExerciseFeedback, ExerciseType } from "@/lib/types";
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

// ── Tier helpers ─────────────────────────────────────────────────────────────

type Tier = 1 | 2 | 3;

const CLIENT_GRADED: ExerciseType[] = ["multiple_choice", "trace_output", "fill_blank"];
const TIER2_TYPES: ExerciseType[] = ["fix_bug", "complete_function", "adapt", "build_from_spec"];

function getTier(ex: Exercise, idx: number): Tier {
  if (ex.type && CLIENT_GRADED.includes(ex.type)) return 1;
  if (ex.type && TIER2_TYPES.includes(ex.type)) return 2;
  if (ex.type) return 3;
  // Legacy (no type): first 2 are tier 2, rest tier 3
  return idx < 2 ? 2 : 3;
}

const TIER_META: Record<Tier, { label: string; color: string; border: string }> = {
  1: { label: "Comprehension",  color: "text-violet-400",  border: "border-violet-500/20" },
  2: { label: "Guided Coding",  color: "text-sky-400",     border: "border-sky-500/20"    },
  3: { label: "Challenge",      color: "text-orange-400",  border: "border-orange-500/20" },
};

const TYPE_LABEL: Partial<Record<ExerciseType, string>> = {
  multiple_choice:   "Multiple Choice",
  trace_output:      "Trace the Output",
  fill_blank:        "Fill in the Blank",
  fix_bug:           "Fix the Bug",
  complete_function: "Complete the Function",
  adapt:             "Adapt the Code",
  build_from_spec:   "Build from Spec",
  debug_explain:     "Debug + Explain",
  edge_case:         "Edge Case",
  mini_project:      "Mini Project",
};

// ── Tier 1 — client-graded components ────────────────────────────────────────

function MultiChoiceExercise({ ex, onPass }: { ex: Exercise; onPass: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;
  const correct = selected === ex.answer;

  function handleSelect(opt: string) {
    if (answered) return;
    setSelected(opt);
    if (opt === ex.answer) {
      toast.success("Correct! ✓");
      onPass();
    } else {
      toast.error("Not quite — try reading the hint.");
    }
  }

  return (
    <div className="space-y-3">
      {(ex.options ?? []).map((opt) => {
        const isSelected = selected === opt;
        const isCorrect = answered && opt === ex.answer;
        const isWrong = isSelected && !correct;
        return (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            disabled={answered}
            className={clsx(
              "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
              !answered && "hover:border-indigo-500/40 hover:bg-indigo-500/5 border-[#2e3245] text-slate-300",
              isCorrect && "border-emerald-500/40 bg-emerald-500/5 text-emerald-300",
              isWrong && "border-red-500/40 bg-red-500/5 text-red-300",
              answered && !isSelected && "border-[#2e3245] text-slate-500 opacity-50",
            )}
          >
            <span className="flex items-center gap-3">
              {answered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              {answered && isWrong && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              {opt}
            </span>
          </button>
        );
      })}
      {answered && !correct && (
        <p className="text-xs text-amber-300 flex items-start gap-1.5 pt-1">
          <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
          {ex.hints[0] ?? "Think about what the function name suggests."}
        </p>
      )}
    </div>
  );
}

function TraceOutputExercise({ ex, onPass }: { ex: Exercise; onPass: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;
  const correct = selected === ex.answer;

  return (
    <div className="space-y-4">
      {/* Code to trace */}
      {ex.code_to_trace && (
        <div className="bg-[#0a0d14] border border-[#2e3245] rounded-lg overflow-hidden">
          <div className="px-4 py-2 border-b border-[#2e3245]">
            <span className="text-xs text-slate-500 font-mono">Trace this code →</span>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-300 leading-5">{ex.code_to_trace}</pre>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {(ex.options ?? []).map((opt) => {
          const isSelected = selected === opt;
          const isCorrect = answered && opt === ex.answer;
          const isWrong = isSelected && !correct;
          return (
            <button
              key={opt}
              onClick={() => {
                if (answered) return;
                setSelected(opt);
                if (opt === ex.answer) { toast.success("Correct! ✓"); onPass(); }
                else toast.error("Not quite — trace each line carefully.");
              }}
              disabled={answered}
              className={clsx(
                "px-4 py-3 rounded-xl border text-sm font-mono transition-all",
                !answered && "hover:border-indigo-500/40 hover:bg-indigo-500/5 border-[#2e3245] text-slate-300",
                isCorrect && "border-emerald-500/40 bg-emerald-500/5 text-emerald-300",
                isWrong && "border-red-500/40 bg-red-500/5 text-red-300",
                answered && !isSelected && "border-[#2e3245] text-slate-500 opacity-50",
              )}
            >
              {answered && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-emerald-400" />}
              {answered && isWrong && <XCircle className="w-3.5 h-3.5 inline mr-1.5 text-red-400" />}
              {opt}
            </button>
          );
        })}
      </div>
      {answered && !correct && (
        <p className="text-xs text-amber-300 flex items-start gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
          {ex.hints[0] ?? "Step through each operation one at a time."}
        </p>
      )}
    </div>
  );
}

function FillBlankExercise({ ex, onPass }: { ex: Exercise; onPass: () => void }) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  function handleSubmit() {
    const normalised = value.trim().replace(/\s+/g, "");
    const expected = (ex.answer ?? "").trim().replace(/\s+/g, "");
    const isCorrect = normalised === expected;
    setCorrect(isCorrect);
    setSubmitted(true);
    if (isCorrect) { toast.success("Correct! ✓"); onPass(); }
    else toast.error("Not quite — check the hint.");
  }

  const template = ex.template ?? ex.prompt;
  const parts = template.split("____");

  return (
    <div className="space-y-4">
      <div className="bg-[#0a0d14] border border-[#2e3245] rounded-lg px-4 py-3 font-mono text-sm text-slate-300 leading-6 flex items-center flex-wrap gap-x-1">
        {parts.map((part, i) => (
          <span key={i} className="flex items-center gap-x-1">
            <span>{part}</span>
            {i < parts.length - 1 && (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                disabled={submitted && correct}
                placeholder="______"
                className={clsx(
                  "inline-block bg-[#1a1d27] border rounded px-2 py-0.5 text-sm font-mono w-36 outline-none transition-colors",
                  !submitted && "border-indigo-500/40 text-indigo-300 focus:border-indigo-400",
                  submitted && correct && "border-emerald-500/40 text-emerald-300",
                  submitted && !correct && "border-red-500/40 text-red-300",
                )}
              />
            )}
          </span>
        ))}
      </div>
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4" /> Check Answer
        </button>
      ) : correct ? (
        <p className="text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Correct!
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-red-400 flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Not quite.
          </p>
          <p className="text-xs text-amber-300 flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
            {ex.hints[0] ?? "Re-read the step about annualising."}
          </p>
          <button
            onClick={() => { setValue(""); setSubmitted(false); }}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main ExerciseEngine ───────────────────────────────────────────────────────

export default function ExerciseEngine({ exercises, moduleSlug, lessonIndex, lessonTitle }: Props) {
  const [idx, setIdx] = useState(0);
  const [code, setCode] = useState(exercises[0]?.starter_code ?? "");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [passed, setPassed] = useState<boolean[]>(() => exercises.map(() => false));

  const currentExercise = exercises[idx];
  const tier = getTier(currentExercise, idx);
  const tierMeta = TIER_META[tier];
  const typeLabel = currentExercise.type ? (TYPE_LABEL[currentExercise.type] ?? currentExercise.type) : "Coding";
  const isClientGraded = tier === 1;

  const switchExercise = useCallback((newIdx: number) => {
    setIdx(newIdx);
    setCode(exercises[newIdx]?.starter_code ?? "");
    setOutput("");
    setFeedback(null);
    setShowHints(false);
    setShowOutput(false);
  }, [exercises]);

  function markPassed(i: number) {
    setPassed((prev) => { const n = [...prev]; n[i] = true; return n; });
  }

  async function runCode() {
    if (!code.trim()) return;
    setRunning(true);
    setShowOutput(true);
    setOutput("Running…");
    const result = await runPython(code);
    setOutput(result);
    setRunning(false);
  }

  async function submitCode() {
    if (!code.trim()) return;
    setSubmitting(true);
    const execOutput = output || await runPython(code);
    if (!output) { setOutput(execOutput); setShowOutput(true); }
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
        markPassed(idx);
        toast.success(`✓ Passed! +30 XP`, { duration: 4000 });
      } else {
        toast.error(`Score: ${fb.score}/100 — read the feedback`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const completedCount = passed.filter(Boolean).length;

  return (
    <div className="space-y-5">

      {/* ── Exercise selector row ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {completedCount}/{exercises.length} completed
          </p>
          <div className="flex gap-1">
            {exercises.map((ex, i) => {
              const t = getTier(ex, i);
              const tm = TIER_META[t];
              return (
                <button
                  key={i}
                  onClick={() => switchExercise(i)}
                  title={`Ex ${i + 1}: ${TYPE_LABEL[ex.type ?? "fix_bug" as ExerciseType] ?? "Exercise"}`}
                  className={clsx(
                    "w-7 h-7 rounded-lg text-xs font-bold transition-all border",
                    i === idx
                      ? `bg-[#1a1d27] ${tm.color} ${tm.border}`
                      : passed[i]
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "text-slate-600 border-[#2e3245] hover:text-slate-400"
                  )}
                >
                  {passed[i] ? "✓" : i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier legend */}
        <div className="flex items-center gap-4 text-xs text-slate-600">
          {([1, 2, 3] as Tier[]).map((t) => (
            <span key={t} className={clsx("flex items-center gap-1", TIER_META[t].color, "opacity-70")}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Tier {t}: {TIER_META[t].label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Exercise prompt card ── */}
      <div className={clsx("bg-[#1a1d27] border rounded-xl p-5", tierMeta.border)}>
        <div className="flex items-center gap-2 mb-3">
          <Zap className={clsx("w-4 h-4", tierMeta.color)} />
          <span className={clsx("text-xs font-bold uppercase tracking-wider", tierMeta.color)}>
            Exercise {idx + 1} · {tierMeta.label} · {typeLabel}
          </span>
          {passed[idx] && (
            <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Done
            </span>
          )}
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{currentExercise?.prompt}</p>

        {/* Hints — only show for code exercises */}
        {!isClientGraded && (currentExercise?.hints?.length ?? 0) > 0 && (
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

      {/* ── Tier 1: client-graded ── */}
      {isClientGraded && (
        <div className="bg-[#1a1d27] border border-[#2e3245] rounded-xl p-5">
          {currentExercise.type === "multiple_choice" && (
            <MultiChoiceExercise ex={currentExercise} onPass={() => markPassed(idx)} />
          )}
          {currentExercise.type === "trace_output" && (
            <TraceOutputExercise ex={currentExercise} onPass={() => markPassed(idx)} />
          )}
          {currentExercise.type === "fill_blank" && (
            <FillBlankExercise ex={currentExercise} onPass={() => markPassed(idx)} />
          )}
          {/* Hint shown inline for Tier 1 — already shown inside each component */}
        </div>
      )}

      {/* ── Tier 2 & 3: Monaco editor ── */}
      {!isClientGraded && (
        <>
          <div className="bg-[#1a1d27] border border-[#2e3245] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2e3245]">
              <span className="text-xs text-slate-500 font-mono">main.py</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setCode(currentExercise?.starter_code ?? ""); setFeedback(null); setOutput(""); }}
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
        </>
      )}
    </div>
  );
}
