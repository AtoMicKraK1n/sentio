import type { Rule } from "../types/rule";
import { createFinding } from "./utils";

function hasValidationSignals(windowText: string): boolean {
  return (
    /\b(owner\s*=|constraint\s*=|has_one\s*=|seeds\s*=|bump\b|address\s*=)\b/.test(
      windowText,
    ) ||
    /\b(is_signer|Signer<'info>)\b/.test(windowText) ||
    /\bcheck_\w+\(/.test(windowText)
  );
}

function hasCheckComment(line: string, prevLine: string): boolean {
  return /\/\/\/\s*CHECK:/i.test(line) || /\/\/\/\s*CHECK:/i.test(prevLine);
}

export const uncheckedAccountUsageRule: Rule = {
  id: "SW007",
  title: "Unchecked account usage without validation",
  description:
    "Detects UncheckedAccount/AccountInfo usage without nearby owner/signer/seeds/address constraints.",
  severity: "high",
  match(file) {
    const findings = [];
    const lines = file.source.split("\n");

    const uncheckedDeclRegex =
      /\bpub\s+([A-Za-z_]\w*)\s*:\s*(UncheckedAccount<'info>|AccountInfo<'info>)/g;

    for (const match of file.source.matchAll(uncheckedDeclRegex)) {
      const idx = match.index ?? 0;
      const fieldName = match[1] ?? "account";
      const lineNo = file.source.slice(0, idx).split("\n").length - 1;

      const start = Math.max(0, lineNo - 6);
      const end = Math.min(lines.length - 1, lineNo + 8);
      const windowLines = lines.slice(start, end + 1);
      const windowText = windowLines.join("\n");

      const thisLine = lines[lineNo] ?? "";
      const prevLine = lines[lineNo - 1] ?? "";

      const hasSignals = hasValidationSignals(windowText);
      const hasCheck = hasCheckComment(thisLine, prevLine);

      // Suppress when clearly documented + constrained
      if (hasCheck && hasSignals) continue;

      if (!hasSignals) {
        findings.push(
          createFinding({
            ruleId: "SW007",
            severity: "high",
            message: `Unchecked account field '${fieldName}' appears without nearby validation constraints.`,
            file: file.path,
            source: file.source,
            index: idx,
            fixGuidance:
              "Add explicit owner/signer/seeds/address/has_one constraints, or use typed accounts when possible. If intentionally unchecked, document with a precise CHECK rationale.",
          }),
        );
      }
    }

    return findings;
  },
};
