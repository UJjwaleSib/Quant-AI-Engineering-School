"use client";
import Link from "next/link";
import { CheckCircle2, Circle, Lock, ArrowRight } from "lucide-react";
import clsx from "clsx";
import type { Module } from "@/lib/types";

interface Props {
  module: Module;
  completedLessons: number;
  locked?: boolean;
  track: "quant" | "ai";
}

const TRACK_COLORS = {
  quant: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", ring: "#10b981" },
  ai:    { bg: "bg-indigo-500/10",  border: "border-indigo-500/20",  text: "text-indigo-400",  ring: "#6366f1" },
};

export default function ModuleCard({ module, completedLessons, locked = false, track }: Props) {
  const colors = TRACK_COLORS[track];
  const pct = module.lesson_count > 0 ? Math.round((completedLessons / module.lesson_count) * 100) : 0;
  const done = pct === 100;

  return (
    <div className={clsx(
      "relative bg-[#1a1d27] border rounded-xl p-5 transition-all group",
      locked ? "border-[#2e3245] opacity-50 cursor-not-allowed" : `border-[#2e3245] hover:${colors.border} hover:shadow-lg`
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", colors.bg, colors.text)}>
          {module.slug}
        </div>
        {done ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        ) : locked ? (
          <Lock className="w-4 h-4 text-slate-600 flex-shrink-0" />
        ) : (
          <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
        )}
      </div>

      <h3 className="font-semibold text-sm text-white mb-1 leading-tight">{module.title}</h3>
      <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{module.description}</p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>{completedLessons}/{module.lesson_count} lessons</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1 bg-[#2e3245] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: colors.ring }}
          />
        </div>
      </div>

      {/* CTA */}
      {!locked && (
        <Link
          href={`/modules/${module.slug}`}
          className={clsx(
            "flex items-center gap-1.5 text-xs font-medium transition-all",
            done ? "text-emerald-400" : colors.text,
            "group-hover:gap-2.5"
          )}
        >
          {done ? "Review" : completedLessons > 0 ? "Continue" : "Start"}
          <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
