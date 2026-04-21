import type { ScanResult } from "../types/scan-result";

export function reportJson(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}
