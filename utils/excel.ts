// utils/excel.ts
import * as XLSX from "xlsx";
import { EXCEL_FILES } from "@/lib/files";
import type { QAErrorRecord, SourceFileName } from "@/types/qa";
import { safeText } from "@/utils/format";

type SheetRow = Record<string, unknown>;

type WorkbookLoadResult = {
  records: QAErrorRecord[];
  loadedFiles: string[];
};

const HEADER_ALIASES = {
  timestamp: [
    "timestamp",
    "date timestamp",
    "date/timestamp",
    "date/time",
    "datetime",
    "date"
  ],
  callCenter: ["call center", "callcenter", "vendor"],
  agentName: ["agent's name", "agents name", "agent name", "agent", "name"],
  agentEmail: ["email address", "email", "submitted by"],
  feedbackType: ["type of feedback", "feedback type"],
  concern: [
    "purpose",
    "concern",
    "ai mistake",
    "what was wrong with this group request created with ai? (email, location, #rooms, etc)",
    "concern for review"
  ],
  resolution: ["resolution provided", "internal recommendation", "recommendation"],
  errorType: [
    "sales cs or groups error",
    "concern for review",
    "this request has been submitted with",
    "ai mistake"
  ],
  itinerary: ["itinerary #", "it#", "original itinerary # created with ai"],
  newItinerary: ["new itinerary #"],
  callId: ["call id", "call id#"],
  requestId: ["request id created with ai", "request id created with ai 2", "request id"],
  newRequestId: ["new request id"],
  supportDocs: ['support docs. "url link "', "support docs", "url link"],
  providedBy: ["provided by:", "provided by"],
  recommendation: ["internal recommendation", "recommendation"],
  notes: ["sierra", "notes"]
};

function normalizeHeader(header: string): string {
  return safeText(header)
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .trim()
    .toLowerCase();
}

function getValue(row: SheetRow, aliases: string[]): string {
  const normalizedEntries = Object.entries(row).map(
    ([key, value]) => [normalizeHeader(key), value] as const
  );

  for (const alias of aliases) {
    const target = normalizeHeader(alias);
    const found = normalizedEntries.find(([key]) => key === target);
    if (found) return safeText(found[1]);
  }

  for (const alias of aliases) {
    const target = normalizeHeader(alias);
    const found = normalizedEntries.find(([key]) => key.includes(target) || target.includes(key));
    if (found) return safeText(found[1]);
  }

  return "";
}

function excelDateToISO(value: unknown): { date: string; rawDate: string } {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      date: value.toISOString().slice(0, 10),
      rawDate: value.toISOString()
    };
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (parsed) {
      const date = new Date(
        Date.UTC(
          parsed.y,
          parsed.m - 1,
          parsed.d,
          parsed.H || 0,
          parsed.M || 0,
          Math.floor(parsed.S || 0)
        )
      );

      return {
        date: date.toISOString().slice(0, 10),
        rawDate: date.toISOString()
      };
    }
  }

  const text = safeText(value);
  if (!text) return { date: "Unknown", rawDate: "" };

  const parsed = new Date(text);

  if (!Number.isNaN(parsed.getTime())) {
    return {
      date: parsed.toISOString().slice(0, 10),
      rawDate: text
    };
  }

  return {
    date: text,
    rawDate: text
  };
}

function inferErrorType(row: SheetRow): string {
  const explicit = getValue(row, HEADER_ALIASES.errorType);
  const concern = `${getValue(row, HEADER_ALIASES.concern)} ${explicit}`.toLowerCase();

  if (explicit && !["corrective", "positive (shout-out)", "feedback"].includes(explicit.toLowerCase())) {
    return explicit;
  }

  if (concern.includes("email")) return "Incorrect Email Address";
  if (concern.includes("date") || concern.includes("check in") || concern.includes("check-in")) {
    return "Incorrect Dates";
  }
  if (concern.includes("location") || concern.includes("city")) return "Incorrect Location";
  if (concern.includes("room") || concern.includes("rooms") || concern.includes("#rooms")) {
    return "Incorrect Room Details";
  }
  if (
    concern.includes("hotel direct") ||
    concern.includes("directly") ||
    concern.includes("hotel directly")
  ) {
    return "Misrepresented Hotel Affiliation";
  }
  if (concern.includes("refund") || concern.includes("cancel")) return "Refund / Cancellation Issue";
  if (
    concern.includes("pool") ||
    concern.includes("amenity") ||
    concern.includes("breakfast") ||
    concern.includes("fridge")
  ) {
    return "Incorrect Amenity Information";
  }
  if (concern.includes("price") || concern.includes("charged") || concern.includes("payment")) {
    return "Billing / Price Issue";
  }
  if (concern.includes("lead") || concern.includes("request")) return "Group Request Issue";

  return explicit || "Uncategorized Error";
}

// utils/excel.ts

function getSourceDisplayName(sourceFile: SourceFileName): string {
  if (sourceFile === "HP AI Feedback.xlsx") return "Concentrix feedbacks";
  if (sourceFile === "AI-MISTAKES-BUWELO (1).xlsx") return "Buwelo AI Mistakes";
  if (sourceFile === "Reviews-2026.xlsx") return "HP-Office-feedback";
  return sourceFile;
}

// utils/excel.ts

function getSourceCallCenter(sourceFile: SourceFileName): string {
  if (sourceFile === "HP AI Feedback.xlsx") return "Concentrix feedbacks";
  if (sourceFile === "AI-MISTAKES-BUWELO (1).xlsx") return "Buwelo";
  if (sourceFile === "Reviews-2026.xlsx") return "HP-Office-feedback";

  return "Unknown";
}

function normalizeCallCenter(row: SheetRow, sourceFile: SourceFileName): string {
  // Everything from HP AI Feedback.xlsx must display as Concentrix feedbacks.
  if (sourceFile === "HP AI Feedback.xlsx") {
    return "Concentrix feedbacks";
  }

  const rowCallCenter = getValue(row, HEADER_ALIASES.callCenter);

  if (rowCallCenter && rowCallCenter.toLowerCase() !== "unknown") {
    return rowCallCenter;
  }

  return getSourceCallCenter(sourceFile);
}

function normalizeRecord(
  row: SheetRow,
  sourceFile: SourceFileName,
  sourceSheet: string,
  rowIndex: number
): QAErrorRecord | null {
  const timestampKey = Object.keys(row).find((key) => {
    const normalized = normalizeHeader(key);
    return normalized.includes("timestamp") || normalized.includes("date");
  });

  const timestampRaw = timestampKey ? row[timestampKey] : "";
  const { date, rawDate } = excelDateToISO(timestampRaw);

  const agentName = getValue(row, HEADER_ALIASES.agentName);
  const agentEmail = getValue(row, HEADER_ALIASES.agentEmail);
  const concern = getValue(row, HEADER_ALIASES.concern);
  const requestId = getValue(row, HEADER_ALIASES.requestId);
  const itinerary = getValue(row, HEADER_ALIASES.itinerary);

  const hasMeaningfulData = [agentName, agentEmail, concern, requestId, itinerary].some(Boolean);
  if (!hasMeaningfulData) return null;

  const fallbackAgent = agentName || agentEmail || "Unknown Agent";
  const feedbackType = getValue(row, HEADER_ALIASES.feedbackType);

  return {
    id: `${sourceFile}-${sourceSheet}-${rowIndex + 2}`,
    sourceFile,
    sourceLabel: getSourceDisplayName(sourceFile),
    sourceSheet,
    rowNumber: rowIndex + 2,
    date,
    rawDate,
    agentName: fallbackAgent,
    agentEmail,
    callCenter: normalizeCallCenter(row, sourceFile),
    feedbackType: feedbackType || "AI Feedback",
    errorType: inferErrorType(row),
    qaArea: getValue(row, ["Sales CS or Groups Error", "sales cs or groups error"]) || "Not Specified",
    itinerary,
    callId: getValue(row, HEADER_ALIASES.callId),
    requestId,
    newItinerary: getValue(row, HEADER_ALIASES.newItinerary),
    newRequestId: getValue(row, HEADER_ALIASES.newRequestId),
    concern,
    resolution: getValue(row, HEADER_ALIASES.resolution),
    providedBy: getValue(row, HEADER_ALIASES.providedBy),
    recommendation: getValue(row, HEADER_ALIASES.recommendation),
    supportDocs: getValue(row, HEADER_ALIASES.supportDocs),
    notes: getValue(row, HEADER_ALIASES.notes),
    raw: row
  };
}

async function readWorkbook(fileName: SourceFileName, path: string): Promise<QAErrorRecord[]> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Could not load ${fileName}`);
  }

  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: false
  });

  const records: QAErrorRecord[] = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<SheetRow>(sheet, {
      defval: "",
      raw: true
    });

    rows.forEach((row, rowIndex) => {
      const normalized = normalizeRecord(row, fileName, sheetName, rowIndex);

      if (normalized) {
        records.push(normalized);
      }
    });
  });

  return records;
}

export async function loadAllExcelFiles(): Promise<WorkbookLoadResult> {
  const fileResults = await Promise.all(
    EXCEL_FILES.map((file) => readWorkbook(file.name, file.path))
  );

  const records = fileResults
    .flat()
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    records,
    loadedFiles: EXCEL_FILES.map((file) => file.label || getSourceDisplayName(file.name))
  };
}

export function exportCombinedWorkbook(records: QAErrorRecord[]): void {
  const rows = records.map((record) => ({
    Date: record.date,
    "Agent Name": record.agentName,
    "Agent Email": record.agentEmail,
    "Call Center": record.callCenter,
    "Feedback Type": record.feedbackType,
    "Error Type": record.errorType,
    "QA Area": record.qaArea,
    "Itinerary #": record.itinerary,
    "Call ID": record.callId,
    "Request ID": record.requestId,
    "New Itinerary #": record.newItinerary,
    "New Request ID": record.newRequestId,
    Concern: record.concern,
    Resolution: record.resolution,
    "Provided By": record.providedBy,
    Recommendation: record.recommendation,
    "Support Docs": record.supportDocs,
    Notes: record.notes,
    Source: record.sourceLabel,
    "Original File": record.sourceFile,
    "Source Sheet": record.sourceSheet,
    "Source Row": record.rowNumber
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Combined AI Mistakes");

  XLSX.writeFile(
    workbook,
    `HotelPlanner-AI-QA-Combined-${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}