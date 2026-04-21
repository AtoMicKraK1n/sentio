import type { Finding, Severity } from "../types/finding";

export function getLineAndColumn(source: string, index: number): { line: number; column: number } {
  const safeIndex = Math.max(0, Math.min(index, source.length));
  const prefix = source.slice(0, safeIndex);
  const line = prefix.split("\n").length;
  const lastNewline = prefix.lastIndexOf("\n");
  const column = safeIndex - lastNewline;
  return { line, column };
}

export function createFinding(params: {
  ruleId: string;
  severity: Severity;
  message: string;
  file: string;
  source: string;
  index: number;
  fixGuidance: string;
}): Finding {
  const { line, column } = getLineAndColumn(params.source, params.index);
  return {
    ruleId: params.ruleId,
    severity: params.severity,
    message: params.message,
    file: params.file,
    line,
    column,
    fixGuidance: params.fixGuidance,
  };
}

export function isLikelyComment(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*");
}

export function nearbyHasPattern(lines: string[], centerLine: number, radius: number, pattern: RegExp): boolean {
  const start = Math.max(0, centerLine - radius);
  const end = Math.min(lines.length - 1, centerLine + radius);
  for (let i = start; i <= end; i += 1) {
    if (pattern.test(lines[i] ?? "")) {
      return true;
    }
  }
  return false;
}
