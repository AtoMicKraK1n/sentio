import type { Finding, Severity } from "./finding";

export interface ScanSummary {
  total: number;
  bySeverity: Record<Severity, number>;
}

export interface ScanResult {
  findings: Finding[];
  summary: ScanSummary;
}
