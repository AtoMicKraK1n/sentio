import type { Rule } from "../types/rule";
import { createFinding, nearbyHasPattern } from "./utils";

export const arbitraryCpiTargetRule: Rule = {
  id: "SW003",
  title: "Potential arbitrary CPI target",
  description:
    "Detects CPI invocations where target program validation is not visible nearby.",
  severity: "critical",
  match(file) {
    const findings = [];
    const lines = file.source.split("\n");
    const invokeRegex = /\binvoke(?:_signed)?\s*\(/g;

    for (const match of file.source.matchAll(invokeRegex)) {
      const idx = match.index ?? 0;
      const lineNo = file.source.slice(0, idx).split("\n").length - 1;
      const hasProgramValidationNearby = nearbyHasPattern(
        lines,
        lineNo,
        12,
        /(check_id\s*\(|program_id\s*(==|!=)|Program<'info,\s*\w+>|require_keys_(eq|neq)!|\btoken_program\b|\bsystem_program\b)/,
      );

      if (!hasProgramValidationNearby) {
        findings.push(
          createFinding({
            ruleId: "SW003",
            severity: "critical",
            message:
              "CPI invocation found without nearby target program validation.",
            file: file.path,
            source: file.source,
            index: idx,
            fixGuidance:
              "Explicitly verify CPI target program ID before calling invoke/invoke_signed.",
          }),
        );
      }
    }

    return findings;
  },
};
