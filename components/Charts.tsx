// components/Charts.tsx
"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ChartDatum, QAErrorRecord, TrendDatum } from "@/types/qa";

type ChartProps = {
  errorTypeData: ChartDatum[];
  agentData: ChartDatum[];
  trendData: TrendDatum[];
  onOpen: (records: QAErrorRecord[], title: string) => void;
};

const chartColors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#06b6d4",
  "#8b5cf6",
  "#22c55e",
  "#ec4899",
  "#64748b",
  "#38bdf8",
  "#a855f7"
];

function shortName(name: string, max = 16) {
  if (!name) return "Unknown";
  return name.length > max ? `${name.slice(0, max)}...` : name;
}

function formatTrendDate(value: string) {
  if (!value || value === "Unknown") return "Unknown";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return shortName(value, 10);

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function buildReadablePieData(data: ChartDatum[]) {
  const topItems = data.slice(0, 8);
  const remainingItems = data.slice(8);

  if (!remainingItems.length) return topItems;

  const otherRecords = remainingItems.flatMap((item) => item.records || []);
  const otherValue = remainingItems.reduce((sum, item) => sum + item.value, 0);

  return [
    ...topItems,
    {
      name: "Other Error Types",
      value: otherValue,
      records: otherRecords
    }
  ];
}

function ChartShell({
  title,
  subtitle,
  children,
  footer
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900/80 sm:p-7">
      <div className="mb-5">
        <h3 className="text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
          {title}
        </h3>
        <p className="mt-2 text-base font-bold text-slate-500 dark:text-slate-300">
          {subtitle}
        </p>
      </div>

      <div className="h-[420px] w-full sm:h-[480px] lg:h-[520px]">
        {children}
      </div>

      {footer && <div className="mt-5">{footer}</div>}
    </section>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 shadow-2xl">
      <p className="text-sm font-black text-white">{label || payload[0]?.name}</p>
      <p className="mt-1 text-lg font-black text-red-400">
        {payload[0]?.value} error(s)
      </p>
    </div>
  );
}

export default function Charts({
  errorTypeData,
  agentData,
  trendData,
  onOpen
}: ChartProps) {
  const readablePieData = buildReadablePieData(errorTypeData);

  const trendTickInterval =
    trendData.length > 40
      ? Math.ceil(trendData.length / 8)
      : trendData.length > 20
        ? Math.ceil(trendData.length / 10)
        : 0;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartShell
        title="Errors by Type"
        subtitle="Clean view of top error categories. Click any slice or legend item."
        footer={
          <div className="grid gap-3 sm:grid-cols-2">
            {readablePieData.map((item, index) => (
              <button
                key={item.name}
                type="button"
                onClick={() => onOpen(item.records || [], `Error Type: ${item.name}`)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-red-400 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-red-400 dark:hover:bg-red-950/30"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span className="truncate text-base font-black text-slate-800 dark:text-white">
                    {item.name}
                  </span>
                </div>
                <span className="shrink-0 rounded-xl bg-red-500 px-3 py-1 text-sm font-black text-white">
                  {item.value}
                </span>
              </button>
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={readablePieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="82%"
              innerRadius="48%"
              paddingAngle={3}
              stroke="#020617"
              strokeWidth={3}
              label={false}
              onClick={(data) => onOpen(data.records || [], `Error Type: ${data.name}`)}
            >
              {readablePieData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={chartColors[index % chartColors.length]}
                  className="cursor-pointer outline-none"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell
        title="Top 10 Problem Agents"
        subtitle="Bigger labels and bars. Click a bar to inspect records."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={agentData}
            margin={{ top: 20, right: 20, bottom: 115, left: 15 }}
          >
            <CartesianGrid strokeDasharray="4 4" opacity={0.22} />
            <XAxis
              dataKey="name"
              angle={-35}
              textAnchor="end"
              interval={0}
              height={120}
              tick={{ fontSize: 14, fontWeight: 800, fill: "#94a3b8" }}
              tickFormatter={(value) => shortName(String(value), 15)}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 15, fontWeight: 800, fill: "#94a3b8" }}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              radius={[14, 14, 0, 0]}
              barSize={34}
              onClick={(data) => onOpen(data.records || [], `Agent: ${data.name}`)}
            >
              {agentData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={chartColors[index % chartColors.length]}
                  className="cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>

      <section className="xl:col-span-2">
        <ChartShell
          title="Error Trend Over Time"
          subtitle="Cleaner timeline with fewer date labels. Click a point to inspect that date."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 25, right: 30, bottom: 80, left: 20 }}
              onClick={(event) => {
                const payload = event?.activePayload?.[0]?.payload as TrendDatum | undefined;
                if (payload) onOpen(payload.records, `Date: ${payload.date}`);
              }}
            >
              <CartesianGrid strokeDasharray="4 4" opacity={0.22} />
              <XAxis
                dataKey="date"
                angle={-30}
                textAnchor="end"
                height={85}
                interval={trendTickInterval}
                tick={{ fontSize: 14, fontWeight: 800, fill: "#94a3b8" }}
                tickFormatter={(value) => formatTrendDate(String(value))}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 15, fontWeight: 800, fill: "#94a3b8" }}
                width={45}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;

                  const row = payload[0].payload as TrendDatum;

                  return (
                    <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 shadow-2xl">
                      <p className="text-sm font-black text-white">
                        {row.date}
                      </p>
                      <p className="mt-1 text-lg font-black text-red-400">
                        {row.errors} error(s)
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="errors"
                stroke="#ef4444"
                strokeWidth={5}
                dot={trendData.length > 45 ? false : { r: 5, strokeWidth: 2, fill: "#ef4444" }}
                activeDot={{ r: 10, strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartShell>
      </section>
    </div>
  );
}