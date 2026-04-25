import type { Rule } from "../../types/rule";
import type { Finding } from "../../types/finding";

function getLine(source: string, idx: number): number {
  return source.slice(0, idx).split("\n").length;
}

export const uncheckedAccountUsageRule: Rule = {
  id: "SW007",
  title: "Unchecked account usage without validation",
  severity: "high",
  description:
    "Detects UncheckedAccount/AccountInfo usage without owner/signer/seeds/address constraints.",
  fixGuidance:
    "Prefer typed accounts and enforce explicit constraints (owner, signer, seeds, address) before use.",

  match(file, projectIndex) {
    const findings: Finding[] = [];
    const uncheckedRegex =
      /\bUncheckedAccount\s*<\s*'info\s*>|\bAccountInfo\s*<\s*'info\s*>/g;

    const uncheckedMatches = [...file.source.matchAll(uncheckedRegex)];
    if (uncheckedMatches.length === 0) return findings;

    const hasValidationInFile =
      (projectIndex?.ownerOrConstraintEvidenceByFile.get(file.path)?.length ??
        0) > 0 ||
      /\bowner\s*==|has_one\s*=|constraint\s*=|address\s*=|Signer\s*<\s*'info\s*>|\bis_signer\b/.test(
        file.source,
      );

    const hasValidationAnywhere = projectIndex
      ? [...projectIndex.ownerOrConstraintEvidenceByFile.values()].some(
          (arr) => arr.length > 0,
        )
      : hasValidationInFile;

    if (hasValidationInFile || hasValidationAnywhere) return findings;

    for (const m of uncheckedMatches) {
      const idx = m.index ?? 0;
      findings.push({
        ruleId: "SW007",
        severity: "high",
        message:
          "Unchecked account type is used without clear validation evidence in current project context.",
        file: file.path,
        line: getLine(file.source, idx),
        fixGuidance:
          "Add explicit owner/signer/seeds/address checks (or switch to strongly typed Anchor accounts).",
        column: 0,
      });
    }

    return findings;
  },
};
