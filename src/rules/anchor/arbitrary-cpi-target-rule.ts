import type { Rule } from "../../types/rule";
import type { Finding } from "../../types/finding";

function getLine(source: string, idx: number): number {
  return source.slice(0, idx).split("\n").length;
}

export const arbitraryCpiTargetRule: Rule = {
  id: "SW003",
  title: "Arbitrary CPI target risk",
  severity: "high",
  description:
    "Detects CPI invocation patterns without nearby/known target program validation.",
  fixGuidance:
    "Validate CPI target program IDs explicitly (allowlist or strict address checks) before invocation.",

  match(file, projectIndex) {
    const findings: Finding[] = [];
    const cpiRegex =
      /\binvoke_signed?\s*\(|\bCpiContext::new(?:_with_signer)?\s*\(|\btoken::[a-z_]+\s*\(/g;

    const cpiMatches = [...file.source.matchAll(cpiRegex)];
    if (cpiMatches.length === 0) return findings;

    const hasProgramValidationAnywhere = projectIndex
      ? [...projectIndex.ownerOrConstraintEvidenceByFile.values()].some((arr) =>
          arr.some((e) =>
            /program|token_program|system_program|address|owner|constraint\s*=|has_one\s*=/.test(
              e.snippet,
            ),
          ),
        )
      : /program|token_program|system_program|address|owner|constraint\s*=|has_one\s*=/.test(
          file.source,
        );

    if (hasProgramValidationAnywhere) return findings;

    for (const m of cpiMatches) {
      const idx = m.index ?? 0;
      findings.push({
        ruleId: "SW003",
        severity: "high",
        message:
          "CPI call found without clear target program validation in detected context.",
        file: file.path,
        line: getLine(file.source, idx),
        fixGuidance:
          "Add strict program-id validation before CPI (for example require_keys_eq! against known program IDs).",
        column: 0,
      });
    }

    return findings;
  },
};
