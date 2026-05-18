// types/qa.ts

export type SourceFileName =
  | "Reviews-2026.xlsx"
  | "AI-MISTAKES-BUWELO (1).xlsx"
  | "HP AI Feedback.xlsx";

export type QAErrorRecord = {
  id: string;

  // Original Excel file name
  sourceFile: SourceFileName;

  // Friendly display name used in the dashboard
  // Examples:
  // Reviews-2026.xlsx => HP-Office-feedback
  // HP AI Feedback.xlsx => Concentrix feedbacks
  // AI-MISTAKES-BUWELO (1).xlsx => Buwelo AI Mistakes
  sourceLabel: string;

  sourceSheet: string;
  rowNumber: number;

  date: string;
  rawDate: string;

  agentName: string;
  agentEmail: string;
  callCenter: string;

  feedbackType: string;
  errorType: string;
  qaArea: string;

  itinerary: string;
  callId: string;
  requestId: string;
  newItinerary: string;
  newRequestId: string;

  concern: string;
  resolution: string;
  providedBy: string;
  recommendation: string;
  supportDocs: string;
  notes: string;

  raw: Record<string, unknown>;
};

export type KpiCardKey = "total" | "agents" | "avg" | "download";

export type ChartDatum = {
  name: string;
  value: number;
  records: QAErrorRecord[];
};

export type TrendDatum = {
  date: string;
  errors: number;
  records: QAErrorRecord[];
};