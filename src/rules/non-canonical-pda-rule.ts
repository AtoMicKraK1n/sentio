import type { Rule } from "../types/rule";
import { createFinding } from "./utils";

export const nonCanonicalPdaRule: Rule = {
  id: "SW004",
  title: "Non-canonical PDA derivation patterns",
  description:
    "Detects PDA derivation patterns that may rely on non-canonical bumps or user-controlled bumps.",
  severity: "high",
  match(file) {
    const findings = [];

    const createProgramAddressRegex = /\bcreate_program_address\s*\(/g;
    for (const match of file.source.matchAll(createProgramAddressRegex)) {
      findings.push(
        createFinding({
          ruleId: "SW004",
          severity: "high",
          message:
            "create_program_address usage detected. Non-canonical derivation can enable shadow PDA risks.",
          file: file.path,
          source: file.source,
          index: match.index ?? 0,
          fixGuidance:
            "Prefer Pubkey::find_program_address and validate canonical bump handling.",
        }),
      );
    }

    const userBumpParamRegex = /fn\s+\w+\s*\([^)]*\bbump\s*:\s*u8/gi;
    for (const match of file.source.matchAll(userBumpParamRegex)) {
      findings.push(
        createFinding({
          ruleId: "SW004",
          severity: "high",
          message:
            "Function accepts bump parameter directly. User-supplied bumps can break canonical PDA assumptions.",
          file: file.path,
          source: file.source,
          index: match.index ?? 0,
          fixGuidance:
            "Derive bump internally using find_program_address instead of trusting external bump input.",
        }),
      );
    }

    return findings;
  },
  fixGuidance: "",
};
