import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "AIEngSchool — Quant + AI Engineering",
  description:
    "A personal learning system for quant research and AI engineering. Every module produces real artifacts — code, research logs, strategies.",
  keywords: ["quant finance", "AI engineering", "backtesting", "python", "fintech"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0f1117] text-slate-200 antialiased">
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: { background: "#1a1d27", border: "1px solid #2e3245", color: "#e2e8f0" },
          }}
        />
      </body>
    </html>
  );
}
