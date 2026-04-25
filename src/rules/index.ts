import type { Rule } from "../types/rule";
import { arbitraryCpiTargetRule } from "./anchor/arbitrary-cpi-target-rule";
import { missingOwnerCheckRule } from "./anchor/missing-owner-check-rule";
import { missingSignerAuthRule } from "./anchor/missing-signer-auth-rule";
import { nonCanonicalPdaRule } from "./anchor/non-canonical-pda-rule";
import { missingAccountDiscriminatorCheckRule } from "./anchor/missing-account-discriminator-check-rule";
import { uncheckedAccountUsageRule } from "./anchor/unchecked-account-usage-rule";
import { missingPostCpiReloadRule } from "./anchor/missing-post-cpi-reload-rule";
import { missingTokenMintValidationRule } from "./anchor/missing-token-mint-validation-rule";
import { missingTokenAuthorityValidationRule } from "./anchor/missing-token-authority-validation-rule";
import { unsafeArithmeticCastRule } from "./rust/unsafe-arithmetic-cast-rule";

export const defaultRules: Rule[] = [
  missingSignerAuthRule,
  missingOwnerCheckRule,
  arbitraryCpiTargetRule,
  nonCanonicalPdaRule,
  missingAccountDiscriminatorCheckRule,
  uncheckedAccountUsageRule,
  missingPostCpiReloadRule,
  missingTokenMintValidationRule,
  missingTokenAuthorityValidationRule,
  unsafeArithmeticCastRule,
];

export function createRuleRegistry(): Rule[] {
  return defaultRules;
}
