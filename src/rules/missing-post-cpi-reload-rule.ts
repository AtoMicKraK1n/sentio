import type { Rule } from "../types/rule";
import { createFinding, nearbyHasPattern } from "./utils";

export const missingPostCpiReloadRule: Rule = {
  id: "SW008",
  title: "Missing post-CPI account reload",
  description:
    "Detects CPI invoke contexts where mutated accounts may be used without reload/refresh checks nearby.",
  severity: "high",
  match(file) {
    const findings = [];
    const lines = file.source.split("\n");

    const cpiRegex = /\b(invoke_signed?|\.cpi\(|CpiContext::new|CpiContext::new_with_signer)\b/g;

    for (const match of file.source.matchAll(cpiRegex)) {
      const idx = match.index ?? 0;
      const lineNo = file.source.slice(0, idx).split("\n").length - 1;

      const hasReloadNearby = nearbyHasPattern(lines, lineNo, 12, /\b(reload\(|try_borrow_data\(|refresh\()\b/);

      if (!hasReloadNearby) {
        findings.push(
          createFinding({
            ruleId: "SW008",
            severity: "high",
            message:
              "CPI pattern detected without nearby post-CPI account reload/refresh. Stale in-memory/account views can cause logic errors.",
            file: file.path,
            source: file.source,
            index: idx,
            fixGuidance:
              "After CPI that may mutate accounts, reload affected Anchor accounts (for example `account.reload()?`) or re-read account data before dependent checks.",
          }),
        );
      }
    }

    return findings;
  },
};
