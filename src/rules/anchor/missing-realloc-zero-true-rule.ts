import type { Rule } from "../../types/rule";
import { createFinding } from "../utils";

export const missingReallocZeroTrueRule: Rule = {
  id: "SW019",
  title: "Missing realloc::zero = true",
  severity: "medium",
  description:
    "Detects `realloc` usage without `realloc::zero = true`, which can leave newly allocated bytes uninitialized and increase data-leakage or state-confusion risk.",
  fixGuidance:
    "When using realloc in account constraints, set `realloc::zero = true` unless there is a carefully reviewed reason not to.",

  match(file) {
    const findings = [];
    const accountAttrRegex = /#\s*\[\s*account\s*\(([\s\S]*?)\)\s*\]/g;

    for (const match of file.source.matchAll(accountAttrRegex)) {
      const fullAttr = match[0];
      const inner = match[1] ?? "";
      const idx = match.index ?? 0;

      const hasRealloc = /\brealloc\s*=/.test(inner);
      if (!hasRealloc) continue;

      const hasReallocZeroTrue = /\brealloc::zero\s*=\s*true\b/.test(inner);
      if (hasReallocZeroTrue) continue;

      findings.push(
        createFinding({
          ruleId: "SW019",
          severity: "medium",
          message: "Account uses `realloc` without `realloc::zero = true`.",
          file: file.path,
          source: file.source,
          index: idx,
          fixGuidance:
            "Add `realloc::zero = true` to this account constraint when reallocating account data.",
        }),
      );
    }

    return findings;
  },
};
