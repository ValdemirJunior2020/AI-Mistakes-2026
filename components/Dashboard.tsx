// components/Dashboard.tsx
"use client";

import { AlertTriangle, Download, Loader2, UsersRound, Activity, DatabaseZap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Charts from "@/components/Charts";
import DataTable from "@/components/DataTable";
import DetailModal from "@/components/DetailModal";
import KpiCard from "@/components/KpiCard";
import TabNavigation, { type DashboardTab } from "@/components/TabNavigation";
import ThemeToggle from "@/components/ThemeToggle";
import { exportCombinedWorkbook, loadAllExcelFiles } from "@/utils/excel";
import { formatDecimal, formatNumber } from "@/utils/format";
import type { ChartDatum, QAErrorRecord, TrendDatum } from "@/types/qa";

function groupBy(records: QAErrorRecord[], key: keyof QAErrorRecord): ChartDatum[] {
  const map = new Map<string, QAErrorRecord[]>();
  records.forEach((record) => {
    const value = String(record[key] || "Unknown");
    const list = map.get(value) || [];
    list.push(record);
    map.set(value, list);
  });
  return Array.from(map.entries())
    .map(([name, groupedRecords]) => ({ name, value: groupedRecords.length, records: groupedRecords }))
    .sort((a, b) => b.value - a.value);
}

function buildTrend(records: QAErrorRecord[]): TrendDatum[] {
  const map = new Map<string, QAErrorRecord[]>();
  records.forEach((record) => {
    const value = record.date || "Unknown";
    const list = map.get(value) || [];
    list.push(record);
    map.set(value, list);
  });
  return Array.from(map.entries())
    .map(([date, groupedRecords]) => ({ date, errors: groupedRecords.length, records: groupedRecords }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export default function Dashboard() {
  const [records, setRecords] = useState<QAErrorRecord[]>([]);
  const [loadedFiles, setLoadedFiles] = useState<string[]>([]);
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modal, setModal] = useState<{ title: string; records: QAErrorRecord[] } | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const result = await loadAllExcelFiles();
        setRecords(result.records);
        setLoadedFiles(result.loadedFiles);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const agentData = useMemo(() => groupBy(records, "agentName").slice(0, 10), [records]);
  const allAgentData = useMemo(() => groupBy(records, "agentName"), [records]);
  const errorTypeData = useMemo(() => groupBy(records, "errorType"), [records]);
  const trendData = useMemo(() => buildTrend(records), [records]);
  const uniqueAgents = useMemo(() => new Set(records.map((record) => record.agentName)).size, [records]);
  const avgErrorsPerDay = useMemo(() => {
    const knownDays = new Set(records.map((record) => record.date).filter((date) => date && date !== "Unknown")).size;
    return knownDays ? records.length / knownDays : 0;
  }, [records]);

  function openModal(modalRecords: QAErrorRecord[], title: string) {
    if (!modalRecords.length) return;
    setModal({ title, records: modalRecords });
  }

  function handleDownload() {
    exportCombinedWorkbook(records);
    openModal(records, "Downloaded Combined Excel Dataset");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-400" />
          <h1 className="mt-5 text-3xl font-black">Loading HotelPlanner AI QA Dashboard</h1>
          <p className="mt-2 font-semibold text-slate-400">Merging the three Excel files into one management view...</p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="max-w-xl rounded-3xl border border-red-900 bg-red-950/40 p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-300" />
          <h1 className="mt-5 text-3xl font-black">Dashboard could not load</h1>
          <p className="mt-3 font-semibold text-red-100">{loadError}</p>
          <p className="mt-3 text-sm text-red-200">Confirm all files are inside public/data and their names match the README.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 transition dark:bg-hpDark dark:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-executive backdrop-blur dark:border-slate-800 dark:bg-slate-900/75 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-red-500">
                <DatabaseZap className="h-4 w-4" />
                HotelPlanner Management QA
              </div>
              <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
  <h1 className="max-w-5xl text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-7xl">
    AI Agent Mistakes Executive Dashboard
  </h1>

  <div className="w-fit rounded-3xl border border-red-300 bg-red-50 px-5 py-4 shadow-sm dark:border-red-500/30 dark:bg-red-500/10">
    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
      Report Period
    </p>
    <p className="mt-1 text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
      From Jan 5, 2026 to May 18, 2026
    </p>
  </div>
</div>
              <p className="mt-4 max-w-4xl text-base font-semibold leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                Unified view of AI feedback, Buwelo AI mistakes, and 2026 reviews with clickable charts, executive KPIs, searchable raw data, and Excel export.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {loadedFiles.map((file) => (
                  <span key={file} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {file}
                  </span>
                ))}
              </div>
            </div>
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark((current) => !current)} />
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Total Errors"
            value={formatNumber(records.length)}
            subtitle="All AI mistakes merged across the three source files."
            icon={<AlertTriangle className="h-7 w-7" />}
            records={records}
            onClick={openModal}
          />
          <KpiCard
            title="Unique Agents"
            value={formatNumber(uniqueAgents)}
            subtitle="Distinct agents or submitters attached to the AI issues."
            icon={<UsersRound className="h-7 w-7" />}
            accent="text-blue-400"
            records={records}
            onClick={openModal}
          />
          <KpiCard
            title="Avg Errors / Day"
            value={formatDecimal(avgErrorsPerDay)}
            subtitle="Average based on days where at least one record exists."
            icon={<Activity className="h-7 w-7" />}
            accent="text-amber-400"
            records={records}
            onClick={openModal}
          />
          <button
            type="button"
            onClick={handleDownload}
            className="group rounded-3xl border border-red-400/40 bg-red-500 p-5 text-left text-white shadow-xl shadow-red-500/20 transition hover:-translate-y-1 hover:bg-red-600 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-100">Download Button</p>
                <h3 className="mt-3 text-3xl font-black sm:text-4xl lg:text-5xl">Excel</h3>
              </div>
              <div className="rounded-2xl bg-white/20 p-3 text-white"><Download className="h-7 w-7" /></div>
            </div>
            <p className="mt-4 text-sm font-bold leading-6 text-red-50 sm:text-base">One-click export of the combined clean dataset.</p>
          </button>
        </section>

        <TabNavigation activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "overview" && (
          <Charts errorTypeData={errorTypeData} agentData={agentData} trendData={trendData} onOpen={openModal} />
        )}

        {activeTab === "agents" && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {allAgentData.map((agent) => (
              <button
                key={agent.name}
                type="button"
                onClick={() => openModal(agent.records, `Agent: ${agent.name}`)}
                className="rounded-3xl border border-slate-200 bg-white/85 p-5 text-left shadow-xl transition hover:-translate-y-1 hover:border-red-400 dark:border-slate-800 dark:bg-slate-900/75"
              >
                <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Agent</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{agent.name}</h3>
                <p className="mt-3 text-4xl font-black text-red-500">{agent.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">reported AI issue(s)</p>
              </button>
            ))}
          </section>
        )}

        {activeTab === "types" && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {errorTypeData.map((type) => (
              <button
                key={type.name}
                type="button"
                onClick={() => openModal(type.records, `Error Type: ${type.name}`)}
                className="rounded-3xl border border-slate-200 bg-white/85 p-5 text-left shadow-xl transition hover:-translate-y-1 hover:border-red-400 dark:border-slate-800 dark:bg-slate-900/75"
              >
                <p className="text-sm font-black uppercase tracking-[0.18em] text-red-500">Error Type</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{type.name}</h3>
                <p className="mt-3 text-4xl font-black text-red-500">{type.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">matching record(s)</p>
              </button>
            ))}
          </section>
        )}

        {activeTab === "raw" && <DataTable records={records} onOpen={openModal} />}

        {activeTab !== "raw" && <DataTable records={records} onOpen={openModal} />}
      </div>

      {modal && <DetailModal title={modal.title} records={modal.records} onClose={() => setModal(null)} />}
    </main>
  );
}
