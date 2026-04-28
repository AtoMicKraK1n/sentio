import type { Rule } from "../../types/rule";
import { createFinding } from "../utils";

export const sharedPdaAcrossAuthorityDomainsRule: Rule = {
  id: "SW014",
  title: "Shared PDA across authority domains",
  severity: "high",
  description:
    "Detects PDA constraints that appear to omit authority-domain scoping (for example, user/owner/admin/authority keys) in seeds, which can cause cross-domain PDA collisions.",
  fixGuidance:
    "Include authority-domain keys in PDA seeds (for example `authority.key().as_ref()` / `user.key().as_ref()`), and validate role boundaries with explicit constraints.",

  match(file) {
    const findings = [];

    // Capture each #[account(...)] block
    const accountAttrRegex = /#\s*\[\s*account\s*\(([\s\S]*?)\)\s*\]/g;

    for (const match of file.source.matchAll(accountAttrRegex)) {
      const fullAttr = match[0];
      const inner = match[1] ?? "";
      const idx = match.index ?? 0;

      const hasSeeds = /\bseeds\s*=/.test(inner);
      const hasBump = /\bbump\b(?:\s*=)?/.test(inner);

      // Rule only applies to PDA-constrained accounts
      if (!hasSeeds || !hasBump) continue;

      // Pull seeds expression body: seeds = [ ... ]
      const seedsMatch = inner.match(/\bseeds\s*=\s*\[([\s\S]*?)\]/);
      const seedsBody = seedsMatch?.[1] ?? "";

      // Signals that authority domain is included in seeds
      const hasAuthorityDomainSeed =
        /\b(authority|user|owner|admin|signer|payer)\b\s*\.?\s*key\s*\(/.test(
          seedsBody,
        ) || /\b(authority|user|owner|admin|signer|payer)\b/.test(seedsBody);

      if (hasAuthorityDomainSeed) continue;

      findings.push(
        createFinding({
          ruleId: "SW014",
          severity: "high",
          message:
            "PDA uses seeds+bump but seeds may not include an authority-domain key (user/owner/admin/etc). This can allow cross-domain PDA reuse/collision.",
          file: file.path,
          source: file.source,
          index: idx,
          fixGuidance:
            "Scope PDA seeds by authority domain, for example include `authority.key().as_ref()` (or the correct role key) in `seeds = [...]`.",
        }),
      );
    }

    return findings;
  },
};
