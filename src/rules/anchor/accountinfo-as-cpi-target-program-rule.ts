import type { Rule } from "../../types/rule";
import { createFinding, nearbyHasPattern } from "../utils";

export const accountInfoAsCpiTargetProgramRule: Rule = {
  id: "SW021",
  title: "AccountInfo as CPI target program",
  severity: "critical",
  description:
    "Detects CPI target program accounts typed as `AccountInfo<'info>` instead of `Program<'info, T>`/specific program type, which can weaken executable and identity guarantees.",
  fixGuidance:
    "Use typed program accounts such as `Program<'info, System>` or the specific Anchor program type. If `AccountInfo<'info>` is unavoidable, enforce strict executable and address checks.",

  match(file) {
    const findings = [];
    const lines = file.source.split("\n");

    const cpiProgramFieldRegex =
      /\bpub\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*AccountInfo\s*<\s*'info\s*>/g;

    for (const match of file.source.matchAll(cpiProgramFieldRegex)) {
      const fieldName = match[1];
      const idx = match.index ?? 0;
      const lineNo = file.source.slice(0, idx).split("\n").length - 1;

      const looksLikeProgramField =
        /\b(program|token_program|system_program|associated_token_program|ata_program)\b/i.test(
          fieldName!,
        );

      if (!looksLikeProgramField) continue;

      const hasCheckDocNearby = nearbyHasPattern(
        lines,
        lineNo,
        2,
        /\/\/\/\s*CHECK:/,
      );

      const hasStrongValidationNearby = nearbyHasPattern(
        lines,
        lineNo,
        12,
        /\b(executable|address\s*=|constraint\s*=|owner\s*==|key\s*\(\)\s*==)\b/,
      );

      if (hasCheckDocNearby || hasStrongValidationNearby) continue;

      findings.push(
        createFinding({
          ruleId: "SW021",
          severity: "critical",
          message:
            "CPI target program appears typed as `AccountInfo<'info>` without clear strict validation.",
          file: file.path,
          source: file.source,
          index: idx,
          fixGuidance:
            "Prefer `Program<'info, ...>` for CPI program accounts, or add strict executable and exact address constraints if using `AccountInfo<'info>`.",
        }),
      );
    }

    return findings;
  },
};
