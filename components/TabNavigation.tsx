// components/TabNavigation.tsx
import type { ReactNode } from "react";
import { BarChart3, Database, PieChart, UserRoundSearch } from "lucide-react";

export type DashboardTab = "overview" | "agents" | "types" | "raw";

type TabNavigationProps = {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
};

const tabs: { key: DashboardTab; label: string; icon: ReactNode }[] = [
  { key: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
  { key: "agents", label: "By Agent", icon: <UserRoundSearch className="h-4 w-4" /> },
  { key: "types", label: "Error Types", icon: <PieChart className="h-4 w-4" /> },
  { key: "raw", label: "Raw Data", icon: <Database className="h-4 w-4" /> }
];

export default function TabNavigation({ activeTab, onChange }: TabNavigationProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900/70">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-black transition sm:text-base ${
              activeTab === tab.key
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
