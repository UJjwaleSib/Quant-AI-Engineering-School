"use client";
import { useState } from "react";
import { FlaskConical, ChevronDown, ChevronUp, Trash2, Tag } from "lucide-react";
import clsx from "clsx";
import type { ResearchLog } from "@/lib/types";

interface Props {
  log: ResearchLog;
  onDelete?: (id: number) => void;
}

export default function ResearchLogCard({ log, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(log.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="bg-[#1a1d27] border border-[#2e3245] rounded-xl overflow-hidden transition-all">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-start gap-3 cursor-pointer hover:bg-[#242736]/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <FlaskConical className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 bg-[#242736] rounded text-[10px] font-mono text-slate-400">{log.module_slug}</span>
            <span className="text-[10px] text-slate-600">{date}</span>
          </div>
          <h3 className="text-sm font-semibold text-white truncate">{log.title}</h3>
          {!expanded && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{log.hypothesis}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(log.id); }}
              className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[#2e3245] pt-4 space-y-4">
          {[
            { label: "Hypothesis", value: log.hypothesis, color: "text-blue-400" },
            { label: "Method", value: log.method, color: "text-indigo-400" },
            { label: "Results", value: log.results, color: "text-emerald-400" },
            { label: "Key Insight", value: log.key_insight, color: "text-amber-400" },
            { label: "Next Step", value: log.next_step, color: "text-violet-400" },
          ].map(({ label, value, color }) => (
            value && (
              <div key={label}>
                <div className={clsx("text-[10px] font-bold uppercase tracking-wider mb-1", color)}>{label}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{value}</p>
              </div>
            )
          ))}
          {log.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {log.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-[#242736] rounded-full text-[10px] text-slate-400">
                  <Tag className="w-2.5 h-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
