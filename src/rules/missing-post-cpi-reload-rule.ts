import type { Rule } from "../types/rule";
import type { Finding } from "../types/finding";

function getLine(source: string, idx: number): number {
  return source.slice(0, idx).split("\n").length;
}

export const missingPostCpiReloadRule: Rule = {
  id: "SW008",
  title: "Missing post-CPI account reload",
  severity: "medium",
  description:
    "Detects CPI contexts where mutated accounts may be read again without reload.",
  fixGuidance:
    "Call account.reload()? (or re-fetch state) before reusing CPI-mutated account data.",

  match(file, projectIndex) {
    const findings: Finding[] = [];
    const cpiRegex =
      /\binvoke_signed?\s*\(|\bCpiContext::new(?:_with_signer)?\s*\(|\btoken::[a-z_]+\s*\(/g;

    const cpiMatches = [...file.source.matchAll(cpiRegex)];
    if (cpiMatches.length === 0) return findings;

    const hasReloadInFile =
      (projectIndex?.reloadEvidenceByFile.get(file.path)?.length ?? 0) > 0 ||
      /\.\s*reload\s*\(\s*\)/.test(file.source);

    if (hasReloadInFile) return findings;

    // lenient cross-file suppression for modular repos:
    const hasReloadSomewhere = projectIndex
      ? [...projectIndex.reloadEvidenceByFile.values()].some(
          (arr) => arr.length > 0,
        )
      : false;

    if (hasReloadSomewhere) return findings;

    for (const m of cpiMatches) {
      const idx = m.index ?? 0;
      findings.push({
        ruleId: "SW008",
        title: "Missing post-CPI account reload",
        severity: "medium",
        message:
          "CPI call detected, but no reload evidence found before potential subsequent account usage.",
        file: file.path,
        line: getLine(file.source, idx),
        fixGuidance:
          "After CPI, reload mutated accounts before reading fields again.",
      });
    }

    return findings;
  },
};
