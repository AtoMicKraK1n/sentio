import type { Rule } from "../types/rule";
import { arbitraryCpiTargetRule } from "./arbitrary-cpi-target-rule";
import { missingOwnerCheckRule } from "./missing-owner-check-rule";
import { missingSignerAuthRule } from "./missing-signer-auth-rule";
import { nonCanonicalPdaRule } from "./non-canonical-pda-rule";
import { unsafeArithmeticCastRule } from "./unsafe-arithmetic-cast-rule";

export const defaultRules: Rule[] = [
  missingSignerAuthRule,
  missingOwnerCheckRule,
  arbitraryCpiTargetRule,
  nonCanonicalPdaRule,
  unsafeArithmeticCastRule,
];
