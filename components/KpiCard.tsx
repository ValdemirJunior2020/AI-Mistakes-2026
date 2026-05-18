// components/KpiCard.tsx
import type { ReactNode } from "react";
import type { QAErrorRecord } from "@/types/qa";

type KpiCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  accent?: string;
  records?: QAErrorRecord[];
  onClick?: (records: QAErrorRecord[], title: string) => void;
};

export default function KpiCard({ title, value, subtitle, icon, accent = "text-red-400", records = [], onClick }: KpiCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(records, title)}
      className="group w-full rounded-3xl border border-slate-800/80 bg-white/80 p-5 text-left shadow-xl shadow-slate-950/5 transition hover:-translate-y-1 hover:border-red-400/60 hover:shadow-2xl dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-black/20 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-3 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">{value}</h3>
        </div>
        <div className={`rounded-2xl bg-slate-100 p-3 dark:bg-slate-800 ${accent}`}>{icon}</div>
      </div>
      <p className="mt-4 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300 sm:text-base">{subtitle}</p>
    </button>
  );
}
