// lib/files.ts
import type { SourceFileName } from "@/types/qa";

export const EXCEL_FILES: {
  name: SourceFileName;
  path: string;
  label: string;
  callCenter: string;
  dateRange: string;
  dateNote?: string;
}[] = [
  {
    name: "Reviews-2026.xlsx",
    path: "/data/Reviews-2026.xlsx",
    label: "Reviews 2026",
    callCenter: "Reviews / Mixed",
    dateRange: "Jan 5, 2026 – May 18, 2026"
  },
  {
    name: "AI-MISTAKES-BUWELO (1).xlsx",
    path: "/data/AI-MISTAKES-BUWELO%20(1).xlsx",
    label: "Buwelo AI Mistakes",
    callCenter: "Buwelo",
    dateRange: "Apr 22, 2026 – May 14, 2026"
  },
  {
    name: "HP AI Feedback.xlsx",
    path: "/data/HP%20AI%20Feedback.xlsx",
    label: "Concentrix feedbacks",
    callCenter: "Concentrix",
    dateRange: "Mar 2026 – May 13, 2026",
    dateNote: "Excludes one old outlier date: Apr 22, 2023"
  }
];