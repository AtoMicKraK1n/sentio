import type { Rule } from "../../types/rule";
import { createFinding, nearbyHasPattern } from "../utils";

export const accountInfoDataAccountRule: Rule = {
  id: "SW011",
  title: "AccountInfo used for data account (missing typed account validation)",
  severity: "critical",
  description:
    "Detects data-account-like fields declared as AccountInfo<'info> instead of Account<'info, T>/InterfaceAccount, which can skip owner + discriminator checks.",
  fixGuidance:
    "Use Account<'info, T> (or InterfaceAccount) for deserialized state accounts. Keep AccountInfo<'info> only for raw/unchecked use with explicit validation.",

  match(file) {
    const findings = [];
    const lines = file.source.split("\n");

    // likely data account names
    const dataLikeFieldRegex =
      /\b(state|vault|config|pool|position|user|escrow|market|book|order|line|game|bet|submission|result|metadata|account)\w*\s*:\s*AccountInfo\s*<\s*'info\s*>/gi;

    for (const match of file.source.matchAll(dataLikeFieldRegex)) {
      const idx = match.index ?? 0;
      const lineNo = file.source.slice(0, idx).split("\n").length - 1;

      // suppress when clearly documented as intentionally unchecked
      const hasCheckDocNearby = nearbyHasPattern(
        lines,
        lineNo,
        2,
        /\/\/\/\s*CHECK:/,
      );

      // suppress when explicit strong validation is nearby
      const hasStrongValidationNearby = nearbyHasPattern(
        lines,
        lineNo,
        10,
        /\b(owner\s*==|constraint\s*=|has_one\s*=|seeds\s*=|address\s*=|try_deserialize)\b/,
      );

      if (hasCheckDocNearby || hasStrongValidationNearby) continue;

      findings.push(
        createFinding({
          ruleId: "SW011",
          severity: "critical",
          message:
            "Data-account-like field is typed as AccountInfo<'info> without clear strong validation. This may bypass owner/discriminator guarantees.",
          file: file.path,
          source: file.source,
          index: idx,
          fixGuidance:
            "Prefer Account<'info, T> / InterfaceAccount for state accounts, or add strict owner/discriminator/address constraints with documented safety rationale.",
        }),
      );
    }

    return findings;
  },
};
