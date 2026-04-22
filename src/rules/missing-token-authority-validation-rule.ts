import type { Rule } from "../types/rule";
import { createFinding, nearbyHasPattern } from "./utils";

export const missingTokenAuthorityValidationRule: Rule = {
  id: "SW010",
  title: "Missing token authority validation",
  description:
    "Detects token operations without nearby authority/owner signer validation.",
  severity: "critical",
  match(file) {
    const findings = [];
    const lines = file.source.split("\n");

    const tokenOpsRegex = /\b(transfer_checked|transfer|mint_to|burn|approve|revoke|set_authority|token::)\b/g;

    for (const match of file.source.matchAll(tokenOpsRegex)) {
      const idx = match.index ?? 0;
      const lineNo = file.source.slice(0, idx).split("\n").length - 1;

      const hasAuthorityValidationNearby =
        nearbyHasPattern(lines, lineNo, 10, /\b(authority\s*==|owner\s*==|has_one\s*=|constraint\s*=.*authority|token::authority\s*=)\b/) ||
        nearbyHasPattern(lines, lineNo, 10, /\b(is_signer|Signer<'info>)\b/);

      if (!hasAuthorityValidationNearby) {
        findings.push(
          createFinding({
            ruleId: "SW010",
            severity: "critical",
            message:
              "Token operation detected without nearby authority/owner signer validation.",
            file: file.path,
            source: file.source,
            index: idx,
            fixGuidance:
              "Require explicit authority ownership checks and signer enforcement before token operations.",
          }),
        );
      }
    }

    return findings;
  },
};
