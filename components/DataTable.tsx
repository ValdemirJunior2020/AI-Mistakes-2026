// components/DataTable.tsx
"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { QAErrorRecord } from "@/types/qa";

type DataTableProps = {
  records: QAErrorRecord[];
  onOpen: (records: QAErrorRecord[], title: string) => void;
};

const PAGE_SIZE = 10;

export default function DataTable({ records, onOpen }: DataTableProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((record) =>
      [
        record.agentName,
        record.agentEmail,
        record.callCenter,
        record.errorType,
        record.concern,
        record.resolution,
        record.itinerary,
        record.requestId,
        record.sourceFile
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [records, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900/75 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">Unified Raw Data</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Search, filter, paginate, and click any row for full details.</p>
        </div>
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Search agent, issue, itinerary, source..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-base font-semibold text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-400/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-[1050px] w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-950">
              <tr>
                {["Date", "Agent", "Call Center", "Error Type", "Itinerary/Request", "Concern", "Source"].map((heading) => (
                  <th key={heading} className="px-4 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {visibleRows.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => onOpen([record], `${record.agentName} · ${record.errorType}`)}
                  className="cursor-pointer align-top transition hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <td className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">{record.date}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{record.agentName}</p>
                    {record.agentEmail && <p className="mt-1 text-xs font-semibold text-slate-500">{record.agentEmail}</p>}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">{record.callCenter}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700 dark:bg-red-950/70 dark:text-red-300">{record.errorType}</span>
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                    {record.itinerary || record.requestId || record.callId || "—"}
                  </td>
                  <td className="max-w-xl px-4 py-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{record.concern || "—"}</td>
                  <td className="px-4 py-4 text-xs font-bold text-slate-500">
                    {record.sourceFile}
                    <br />
                    Row {record.rowNumber}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          Showing {visibleRows.length} of {filtered.length} filtered records ({records.length} total)
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={safePage === 1}
            className="rounded-2xl border border-slate-200 p-3 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 dark:bg-slate-950 dark:text-slate-200">
            Page {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={safePage === totalPages}
            className="rounded-2xl border border-slate-200 p-3 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
