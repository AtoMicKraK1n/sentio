import type { Rule } from "../types/rule";
import { createFinding, nearbyHasPattern } from "./utils";

export const missingTokenMintValidationRule: Rule = {
  id: "SW009",
  title: "Missing token mint validation",
  description:
    "Detects SPL token account usage without nearby explicit mint equality validation.",
  severity: "high",
  match(file) {
    const findings = [];
    const lines = file.source.split("\n");

    const tokenFlowRegex =
      /\b(TokenAccount|InterfaceAccount\s*<\s*'info\s*,\s*TokenAccount\s*>|transfer_checked|mint_to|burn|token::transfer)\b/g;

    for (const match of file.source.matchAll(tokenFlowRegex)) {
      const idx = match.index ?? 0;
      const lineNo = file.source.slice(0, idx).split("\n").length - 1;

      const hasMintValidationNearby = nearbyHasPattern(
        lines,
        lineNo,
        10,
        /\b(mint\s*==|\.mint\s*==|constraint\s*=\s*\w+\.mint\s*==|token::mint\s*=)\b/,
      );

      if (!hasMintValidationNearby) {
        findings.push(
          createFinding({
            ruleId: "SW009",
            severity: "high",
            message:
              "Token flow detected without nearby mint validation. Wrong-mint token accounts may be accepted.",
            file: file.path,
            source: file.source,
            index: idx,
            fixGuidance:
              "Enforce explicit mint checks (for example source/destination token account mint equals expected mint).",
          }),
        );
      }
    }

    return findings;
  },
  fixGuidance: "",
};
