import type { Rule } from "../types/rule";
import { createFinding, nearbyHasPattern } from "./utils";

export const uncheckedAccountUsageRule: Rule = {
  id: "SW007",
  title: "Unchecked account usage without validation",
  description:
    "Detects UncheckedAccount/AccountInfo usage for critical roles without nearby owner/signer/seeds constraints.",
  severity: "high",
  match(file) {
    const findings = [];
    const lines = file.source.split("\n");

    const uncheckedRegex = /\b(authority|admin|owner|vault|treasury|config|state)\w*\s*:\s*(UncheckedAccount<'info>|AccountInfo<'info>)/gi;

    for (const match of file.source.matchAll(uncheckedRegex)) {
      const idx = match.index ?? 0;
      const lineNo = file.source.slice(0, idx).split("\n").length - 1;

      const hasValidationNearby =
        nearbyHasPattern(lines, lineNo, 10, /\b(owner\s*=|constraint\s*=|has_one\s*=|seeds\s*=|bump|is_signer)\b/) ||
        nearbyHasPattern(lines, lineNo, 10, /\bcheck_\w+\(/);

      if (!hasValidationNearby) {
        findings.push(
          createFinding({
            ruleId: "SW007",
            severity: "high",
            message:
              "Critical account appears to be unchecked (AccountInfo/UncheckedAccount) without nearby validation constraints.",
            file: file.path,
            source: file.source,
            index: idx,
            fixGuidance:
              "Prefer typed accounts with Anchor constraints, or enforce explicit owner/signer/seeds validation before use.",
          }),
        );
      }
    }

    return findings;
  },
};
