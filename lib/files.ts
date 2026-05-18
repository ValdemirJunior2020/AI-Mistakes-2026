// lib/files.ts
import type { SourceFileName } from "@/types/qa";

export const EXCEL_FILES: {
  name: SourceFileName;
  displayName: string;
  callCenter: string;
  path: string;
}[] = [
  {
    name: "Reviews-2026.xlsx",
    displayName: "Reviews 2026",
    callCenter: "Mixed / Reviews",
    path: "/data/Reviews-2026.xlsx"
  },
  {
    name: "AI-MISTAKES-BUWELO (1).xlsx",
    displayName: "Buwelo AI Mistakes",
    callCenter: "Buwelo",
    path: "/data/AI-MISTAKES-BUWELO%20(1).xlsx"
  },
  {
    name: "HP AI Feedback.xlsx",
    displayName: "Concentrix feedbacks",
    callCenter: "Concentrix",
    path: "/data/HP%20AI%20Feedback.xlsx"
  }
];