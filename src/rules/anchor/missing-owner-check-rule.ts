import type { Rule } from "../../types/rule";
import { createFinding, nearbyHasPattern } from "../utils";

export const missingOwnerCheckRule: Rule = {
  id: "SW002",
  title: "Missing owner check before deserialization",
  description:
    "Detects likely deserialization paths without nearby account owner validation.",
  severity: "critical",
  match(file) {
    const findings = [];
    const lines = file.source.split("\n");

    const deserializeRegex =
      /(try_from_slice\s*\(|from_account_info\s*\(|try_deserialize\s*\()/g;

    for (const match of file.source.matchAll(deserializeRegex)) {
      const idx = match.index ?? 0;
      const lineNo = file.source.slice(0, idx).split("\n").length - 1;
      const hasOwnerCheckNearby = nearbyHasPattern(
        lines,
        lineNo,
        8,
        /(\.owner\s*(==|!=)|owner\s*(==|!=)|Account<'info,\s*\w+>)/,
      );

      if (!hasOwnerCheckNearby) {
        findings.push(
          createFinding({
            ruleId: "SW002",
            severity: "critical",
            message:
              "Deserialization found without nearby owner validation. This can allow untrusted account data parsing.",
            file: file.path,
            source: file.source,
            index: idx,
            fixGuidance:
              "Verify account.owner matches expected program before deserializing account data.",
          }),
        );
      }
    }

    return findings;
  },
  fixGuidance: "",
};
