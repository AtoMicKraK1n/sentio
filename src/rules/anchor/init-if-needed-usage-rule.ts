import type { Rule } from "../../types/rule";
import { createFinding, nearbyHasPattern } from "../utils";

export const initIfNeededUsageRule: Rule = {
  id: "SW017",
  title: "init_if_needed usage (manual review)",
  severity: "high",
  description:
    "Flags usage of `init_if_needed`, which can be safe in some designs but is frequently associated with re-initialization and state-reset risks if guards are incomplete.",
  fixGuidance:
    "Manually review each `init_if_needed` path. Enforce one-time initialization invariants, authority checks, and anti-reset guards (for example `is_initialized`/version checks and strict constraints).",

  match(file) {
    const findings = [];
    const lines = file.source.split("\n");

    const initIfNeededRegex =
      /#\s*\[\s*account\s*\(([\s\S]*?\binit_if_needed\b[\s\S]*?)\)\s*\]/g;

    for (const match of file.source.matchAll(initIfNeededRegex)) {
      const idx = match.index ?? 0;
      const lineNo = file.source.slice(0, idx).split("\n").length - 1;
      const snippet = match[0];
      const inner = match[1] ?? "";

      const hasManualReviewNote = nearbyHasPattern(
        lines,
        lineNo,
        3,
        /manual\s*review|reviewed\s*init_if_needed|safe\s*init_if_needed|\/\/\/\s*CHECK:/i,
      );

      const hasExplicitSuppression =
        /\bsolwarden-ignore\b.*\bSW016\b/i.test(snippet) || hasManualReviewNote;

      if (hasExplicitSuppression) continue;

      const missingStrongGuards =
        !/\b(seeds\s*=|bump|has_one\s*=|constraint\s*=|owner\s*=|address\s*=)\b/.test(
          inner,
        );

      findings.push(
        createFinding({
          ruleId: "SW017",
          severity: "high",
          message: missingStrongGuards
            ? "`init_if_needed` detected with limited visible guard constraints. Manual review required for re-init/state-reset safety."
            : "`init_if_needed` detected. Manual review required to confirm re-initialization safety.",
          file: file.path,
          source: file.source,
          index: idx,
          fixGuidance:
            "Confirm this cannot be abused for unintended re-initialization. Add/verify one-time init guards, strict authority validation, and invariant checks.",
        }),
      );
    }

    return findings;
  },
};
