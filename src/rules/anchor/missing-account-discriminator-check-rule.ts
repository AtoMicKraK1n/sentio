import type { Rule } from "../../types/rule";
import { createFinding, nearbyHasPattern } from "../utils";

export const missingAccountDiscriminatorCheckRule: Rule = {
  id: "SW006",
  title: "Missing account discriminator validation",
  description:
    "Detects account deserialization paths without nearby discriminator checks in native Solana programs.",
  severity: "high",
  match(file) {
    const findings = [];
    const lines = file.source.split("\n");

    const deserializeRegex =
      /\b(Account::try_from|try_deserialize|try_from_slice_unchecked|from_account_info)\b/g;

    for (const match of file.source.matchAll(deserializeRegex)) {
      const idx = match.index ?? 0;
      const lineNo = file.source.slice(0, idx).split("\n").length - 1;

      const hasDiscriminatorCheckNearby = nearbyHasPattern(
        lines,
        lineNo,
        8,
        /\b(discriminator|DISCRIMINATOR|try_deserialize|anchor_lang::Discriminator)\b/,
      );

      if (!hasDiscriminatorCheckNearby) {
        findings.push(
          createFinding({
            ruleId: "SW006",
            severity: "high",
            message:
              "Account deserialization found without nearby discriminator validation. This can allow type confusion/account substitution.",
            file: file.path,
            source: file.source,
            index: idx,
            fixGuidance:
              "Validate account discriminator bytes before or during deserialization (for Anchor, prefer typed Account<T>/AccountLoader<T> with strict deserialize).",
          }),
        );
      }
    }

    return findings;
  },
  fixGuidance: "",
};
