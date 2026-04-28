import type { Rule } from "../../types/rule";
import { createFinding } from "../utils";

export const missingConstraintForUniquenessRule: Rule = {
  id: "SW020",
  title: "Missing constraint for uniqueness",
  severity: "high",
  description:
    "Detects account constraints that appear to require uniqueness/domain separation but do not include strong uniqueness checks such as `address =`, `has_one =`, robust `constraint =`, or adequately scoped PDA seeds.",
  fixGuidance:
    "Add explicit uniqueness constraints using `address = ...`, `has_one = ...`, strict `constraint = ...`, or tightly scoped PDA seeds tied to the correct authority/resource identity.",

  match(file) {
    const findings = [];
    const accountAttrRegex = /#\s*\[\s*account\s*\(([\s\S]*?)\)\s*\]/g;

    for (const match of file.source.matchAll(accountAttrRegex)) {
      const fullAttr = match[0];
      const inner = match[1] ?? "";
      const idx = match.index ?? 0;

      const hasSeeds = /\bseeds\s*=/.test(inner);
      const hasBump = /\bbump\b(?:\s*=)?/.test(inner);
      const hasAddress = /\baddress\s*=/.test(inner);
      const hasHasOne = /\bhas_one\s*=/.test(inner);
      const hasConstraint = /\bconstraint\s*=/.test(inner);

      const isSensitiveContext =
        /\b(init|init_if_needed|mut|realloc\s*=|close\s*=)\b/.test(inner) ||
        (hasSeeds && hasBump);

      if (!isSensitiveContext) continue;

      if (hasAddress || hasHasOne) continue;

      const constraintLooksStrong =
        hasConstraint &&
        /\b(==|!=|key\s*\(|owner|mint|authority|admin|signer|address)\b/.test(
          inner,
        );

      if (constraintLooksStrong) continue;

      const seedsScopedWithIdentity =
        hasSeeds &&
        /\b(authority|owner|user|admin|signer|mint|pool|vault|position|market|config)\b/.test(
          inner,
        );

      if (hasSeeds && hasBump && seedsScopedWithIdentity) continue;

      findings.push(
        createFinding({
          ruleId: "SW020",
          severity: "high",
          message:
            "Account constraint may be missing strong uniqueness/domain-separation checks.",
          file: file.path,
          source: file.source,
          index: idx,
          fixGuidance:
            "Add explicit uniqueness validation using `address =`, `has_one =`, strict `constraint =`, or stronger identity-scoped PDA seeds.",
        }),
      );
    }

    return findings;
  },
};
