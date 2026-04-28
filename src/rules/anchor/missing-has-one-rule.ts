import type { Rule } from "../../types/rule";
import { createFinding } from "../utils";

export const missingHasOneRule: Rule = {
  id: "SW012",
  title: "Missing has_one validation",
  severity: "high",
  description:
    "Detects account structs that likely store authority-like pubkeys but do not enforce has_one/constraint checks.",
  fixGuidance:
    "Add #[account(has_one = <authority_field>)] or equivalent constraint/require_keys_eq! to bind stored pubkeys to provided accounts.",

  match(file) {
    const findings = [];
    const src = file.source;
    const lines = src.split("\n");

    // Heuristic: struct has authority-like Pubkey fields
    const structRegex = /struct\s+([A-Za-z_]\w*)\s*\{([\s\S]*?)\}/g;
    const authorityFieldRegex =
      /\b(authority|admin|owner|manager|treasury|payer)\w*\s*:\s*Pubkey\b/i;

    for (const m of src.matchAll(structRegex)) {
      const full = m[0] ?? "";
      const body = m[2] ?? "";
      const idx = m.index ?? 0;

      if (!authorityFieldRegex.test(body)) continue;

      const lineNo = src.slice(0, idx).split("\n").length - 1;

      // Check nearby Anchor validations around this struct usage area
      const windowStart = Math.max(0, lineNo - 30);
      const windowEnd = Math.min(lines.length - 1, lineNo + 80);
      const windowText = lines.slice(windowStart, windowEnd + 1).join("\n");

      const hasHasOne =
        /\bhas_one\s*=\s*[A-Za-z_]\w*/.test(windowText) ||
        /\bconstraint\s*=.*\.[A-Za-z_]\w*\s*==\s*[A-Za-z_]\w*\.key\(\)/.test(
          windowText,
        ) ||
        /\brequire_keys_eq!\s*\(/.test(windowText);

      if (hasHasOne) continue;

      findings.push(
        createFinding({
          ruleId: "SW012",
          severity: "high",
          message:
            "Struct contains authority-like Pubkey field without clear has_one/constraint binding nearby.",
          file: file.path,
          source: file.source,
          index: idx,
          fixGuidance:
            "Use #[account(has_one = ...)] where possible, or enforce equivalent require_keys_eq! checks for authority binding.",
        }),
      );
    }

    return findings;
  },
};
