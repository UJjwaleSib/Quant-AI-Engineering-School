"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Brain, LayoutDashboard, BookOpen, Code2,
  FlaskConical, ScrollText, LogOut, Zap,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard",      icon: LayoutDashboard, label: "Dashboard"   },
  { href: "/modules",        icon: BookOpen,        label: "Modules"     },
  { href: "/playground",     icon: Code2,           label: "Playground"  },
  { href: "/research-logs",  icon: ScrollText,      label: "Research Logs"},
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem("aes_token");
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[#1a1d27] border-r border-[#2e3245] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#2e3245]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Brain className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-bold text-sm text-white tracking-tight">AIEngSchool</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              path === href || path.startsWith(href + "/")
                ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#242736]"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-[#2e3245] pt-4 space-y-1">
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quant + AI Operator</span>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
