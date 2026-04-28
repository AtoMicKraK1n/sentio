import type { Rule } from "../../types/rule";
import { createFinding } from "../utils";

export const missingPdaSeedsBumpRule: Rule = {
  id: "SW013",
  title: "Missing seeds + bump on PDA",
  severity: "high",
  description:
    "Detects PDA-like account constraints that do not include both `seeds` and `bump`, which weakens deterministic PDA validation and can allow account substitution.",
  fixGuidance:
    "For PDA accounts, use `#[account(seeds = [...], bump)]` (or `bump = <expr>`) and keep seed derivation tied to trusted inputs.",

  match(file) {
    const findings = [];

    // Match each #[account(...)] block
    const accountAttrRegex = /#\s*\[\s*account\s*\(([\s\S]*?)\)\s*\]/g;

    for (const match of file.source.matchAll(accountAttrRegex)) {
      const fullAttr = match[0];
      const inner = match[1] ?? "";
      const idx = match.index ?? 0;

      // only consider PDA-like contexts
      const pdaLike =
        /\b(init|init_if_needed)\b/.test(inner) ||
        /\bseeds\s*=/.test(inner) ||
        /\bbump\b(?:\s*=)?/.test(inner);

      if (!pdaLike) continue;

      const hasSeeds = /\bseeds\s*=/.test(inner);
      const hasBump = /\bbump\b(?:\s*=)?/.test(inner);

      if (hasSeeds && hasBump) continue;

      findings.push(
        createFinding({
          ruleId: "SW013",
          severity: "high",
          message:
            "PDA-like account constraint is missing either `seeds` or `bump`. Enforce both to harden PDA derivation checks.",
          file: file.path,
          source: file.source,
          index: idx,
          fixGuidance:
            "Use `#[account(seeds = [...], bump)]` (or `bump = <expr>`) for PDA accounts.",
        }),
      );
    }

    return findings;
  },
};
