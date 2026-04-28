import type { Rule } from "../../types/rule";
import { createFinding } from "../utils";

export const pdaSeedCollisionRiskRule: Rule = {
  id: "SW015",
  title: "PDA seed collision risk",
  severity: "medium",
  description:
    "Detects PDA seeds that look underspecified (for example only static constants) or risky due to potential ambiguous concatenation patterns.",
  fixGuidance:
    "Use well-scoped seeds with stable domain separators and authority/resource keys. Prefer fixed separators and avoid ambiguous seed composition patterns.",

  match(file) {
    const findings = [];

    const accountAttrRegex = /#\s*\[\s*account\s*\(([\s\S]*?)\)\s*\]/g;

    for (const match of file.source.matchAll(accountAttrRegex)) {
      const fullAttr = match[0];
      const inner = match[1] ?? "";
      const idx = match.index ?? 0;

      const hasSeeds = /\bseeds\s*=/.test(inner);
      const hasBump = /\bbump\b(?:\s*=)?/.test(inner);
      if (!hasSeeds || !hasBump) continue;

      const seedsMatch = inner.match(/\bseeds\s*=\s*\[([\s\S]*?)\]/);
      const seedsBody = seedsMatch?.[1] ?? "";

      // Split top-level seed items (simple heuristic)
      const seedItems = seedsBody
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Static-like seed items
      const staticSeedCount = seedItems.filter(
        (s) => /^b?"[^"]*"$/.test(s) || /^[A-Z0-9_]+$/.test(s),
      ).length;

      // Dynamic/domain signals
      const hasDynamicDomainSignal =
        /\b(key\s*\(|as_ref\s*\(|to_le_bytes\s*\(|to_be_bytes\s*\(|authority|owner|user|admin|mint|pool|vault|market|position|config)\b/.test(
          seedsBody,
        );

      // Ambiguous concat-ish patterns inside a single seed item
      const hasConcatRisk =
        /\+\s*/.test(seedsBody) ||
        /\.concat\s*\(/.test(seedsBody) ||
        /\.join\s*\(/.test(seedsBody);

      const onlyStaticOrTooThin =
        !hasDynamicDomainSignal ||
        (seedItems.length <= 1 && staticSeedCount >= 1);

      if (!onlyStaticOrTooThin && !hasConcatRisk) continue;

      findings.push(
        createFinding({
          ruleId: "SW015",
          severity: "medium",
          message:
            "PDA seeds may be collision-prone (underspecified domain or ambiguous composition).",
          file: file.path,
          source: file.source,
          index: idx,
          fixGuidance:
            "Add clearer domain scoping in seeds (for example authority/resource keys + explicit separators) and avoid ambiguous concatenation patterns.",
        }),
      );
    }

    return findings;
  },
};
