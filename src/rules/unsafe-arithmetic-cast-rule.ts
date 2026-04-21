import type { Rule } from "../types/rule";
import { createFinding, isLikelyComment } from "./utils";

export const unsafeArithmeticCastRule: Rule = {
  id: "SW005",
  title: "Potential unsafe arithmetic or narrowing cast",
  description:
    "Detects arithmetic and cast patterns that commonly lead to overflow or truncation bugs.",
  severity: "high",
  match(file) {
    const findings = [];
    const lines = file.source.split("\n");

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i] ?? "";
      if (isLikelyComment(line)) {
        continue;
      }

      const hasUncheckedArithmetic =
        /(=|return|let\s+\w+)/.test(line) &&
        /[\w\)\]]\s*[+\-*/]\s*[\w\(\[]/.test(line) &&
        !/(checked_|saturating_|wrapping_|overflowing_)/.test(line);

      if (hasUncheckedArithmetic) {
        const charIndex = line.search(/[+\-*/]/);
        const sourceIndex = file.source
          .split("\n")
          .slice(0, i)
          .join("\n").length + (i > 0 ? 1 : 0) + Math.max(charIndex, 0);

        findings.push(
          createFinding({
            ruleId: "SW005",
            severity: "high",
            message:
              "Unchecked arithmetic operation detected in value path.",
            file: file.path,
            source: file.source,
            index: sourceIndex,
            fixGuidance:
              "Use checked_* arithmetic and explicit error handling for overflow/underflow-safe math.",
          }),
        );
      }

      const castMatch = line.match(/\bas\s+(u8|u16|u32|u64|usize|i8|i16|i32|i64|isize)\b/);
      if (castMatch?.index !== undefined) {
        const sourceIndex = file.source
          .split("\n")
          .slice(0, i)
          .join("\n").length + (i > 0 ? 1 : 0) + castMatch.index;

        findings.push(
          createFinding({
            ruleId: "SW005",
            severity: "high",
            message:
              "Potential narrowing or sign-changing cast detected with 'as'.",
            file: file.path,
            source: file.source,
            index: sourceIndex,
            fixGuidance:
              "Use TryFrom/TryInto and handle conversion failures explicitly.",
          }),
        );
      }
    }

    return findings;
  },
};
