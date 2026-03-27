"use client";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Minimize2, MessageSquare, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";
import clsx from "clsx";

interface Props {
  moduleSlug?: string;
  lessonTitle?: string;
  userCode?: string;
}

export default function AIChat({ moduleSlug = "", lessonTitle = "", userCode = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI tutor. I know your current module and code. Ask me anything — concepts, debugging, next steps.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await api.chat.send({
        messages: [...messages, userMsg],
        module_slug: moduleSlug,
        lesson_title: lessonTitle,
        user_code: userCode,
      });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "⚠️ Connection error. Is the backend running?" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-indigo-500 hover:bg-indigo-600 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        >
          <MessageSquare className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 h-[480px] bg-[#1a1d27] border border-[#2e3245] rounded-2xl shadow-2xl flex flex-col z-50 animate-slide-up">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#2e3245]">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-white">AI Tutor</div>
              {moduleSlug && <div className="text-[10px] text-slate-500">{moduleSlug} · {lessonTitle}</div>}
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={clsx("flex gap-2", msg.role === "user" && "flex-row-reverse")}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-indigo-400" />
                  </div>
                )}
                <div className={clsx(
                  "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                  msg.role === "user"
                    ? "bg-indigo-500 text-white"
                    : "bg-[#242736] text-slate-300"
                )}>
                  {msg.role === "assistant" ? (
                    <ReactMarkdown className="prose prose-invert prose-xs max-w-none [&_p]:mb-1 [&_pre]:text-[10px] [&_code]:text-[10px]">
                      {msg.content}
                    </ReactMarkdown>
                  ) : msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-indigo-400" />
                </div>
                <div className="bg-[#242736] rounded-xl px-3 py-2">
                  <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#2e3245]">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask anything…"
                className="flex-1 bg-[#0f1117] border border-[#2e3245] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="w-8 h-8 bg-indigo-500 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
