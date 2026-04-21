import type { Finding, Severity } from "../types/finding";
import type { ParsedFile } from "../types/parsed-file";
import type { Rule } from "../types/rule";
import type { ScanResult } from "../types/scan-result";

const SEVERITY_BUCKETS: Severity[] = ["low", "medium", "high", "critical"];

export function runRules(files: ParsedFile[], rules: Rule[]): ScanResult {
  const findings: Finding[] = [];

  for (const file of files) {
    for (const rule of rules) {
      const matches = rule.match(file);
      findings.push(...matches);
    }
  }

  const bySeverity: Record<Severity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  for (const finding of findings) {
    if (SEVERITY_BUCKETS.includes(finding.severity)) {
      bySeverity[finding.severity] += 1;
    }
  }

  return {
    findings,
    summary: {
      total: findings.length,
      bySeverity,
    },
  };
}
