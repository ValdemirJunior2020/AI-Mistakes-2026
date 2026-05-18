// components/DetailModal.tsx
import { X } from "lucide-react";
import type { QAErrorRecord } from "@/types/qa";

type DetailModalProps = {
  title: string;
  records: QAErrorRecord[];
  onClose: () => void;
};

function InfoLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 break-words text-base font-bold text-slate-900 dark:text-white">{value || "—"}</p>
    </div>
  );
}

export default function DetailModal({ title, records, onClose }: DetailModalProps) {
  if (!records.length) return null;
  const main = records[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-hidden rounded-t-3xl border border-slate-700 bg-white shadow-executive dark:bg-slate-950 sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:p-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-red-500">Detail View</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white sm:text-4xl">{title}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Showing {records.length} related record(s)</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 p-3 text-slate-700 transition hover:bg-red-500 hover:text-white dark:border-slate-700 dark:text-slate-200"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InfoLine label="Date" value={main.date} />
            <InfoLine label="Agent" value={main.agentName} />
            <InfoLine label="Call Center" value={main.callCenter} />
            <InfoLine label="Error Type" value={main.errorType} />
            <InfoLine label="Itinerary" value={main.itinerary} />
            <InfoLine label="Call ID" value={main.callId} />
            <InfoLine label="Request ID" value={main.requestId} />
            <InfoLine label="Source" value={`${main.sourceFile} / ${main.sourceSheet} / Row ${main.rowNumber}`} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/20">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-red-500">Concern / Mistake</p>
              <p className="mt-3 whitespace-pre-wrap text-lg font-semibold leading-8 text-slate-900 dark:text-white">{main.concern || "No concern provided."}</p>
            </div>
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Resolution / Recommendation</p>
              <p className="mt-3 whitespace-pre-wrap text-lg font-semibold leading-8 text-slate-900 dark:text-white">{main.resolution || main.recommendation || "No resolution provided."}</p>
            </div>
          </div>

          {records.length > 1 && (
            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
                  <thead className="bg-slate-100 dark:bg-slate-900">
                    <tr>
                      {["Date", "Agent", "Type", "Concern", "Source"].map((heading) => (
                        <th key={heading} className="px-4 py-4 text-sm font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                    {records.slice(0, 25).map((record) => (
                      <tr key={record.id} className="align-top">
                        <td className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">{record.date}</td>
                        <td className="px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">{record.agentName}</td>
                        <td className="px-4 py-4 text-sm font-bold text-red-500">{record.errorType}</td>
                        <td className="max-w-xl px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{record.concern}</td>
                        <td className="px-4 py-4 text-xs font-semibold text-slate-500">{record.sourceFile} · Row {record.rowNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
