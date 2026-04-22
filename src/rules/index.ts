import type { Rule } from "../types/rule";
import { arbitraryCpiTargetRule } from "./arbitrary-cpi-target-rule";
import { missingOwnerCheckRule } from "./missing-owner-check-rule";
import { missingSignerAuthRule } from "./missing-signer-auth-rule";
import { nonCanonicalPdaRule } from "./non-canonical-pda-rule";
import { unsafeArithmeticCastRule } from "./unsafe-arithmetic-cast-rule";
import { missingAccountDiscriminatorCheckRule } from "./missing-account-discriminator-check-rule";
import { uncheckedAccountUsageRule } from "./unchecked-account-usage-rule";
import { missingPostCpiReloadRule } from "./missing-post-cpi-reload-rule";
import { missingTokenMintValidationRule } from "./missing-token-mint-validation-rule";
import { missingTokenAuthorityValidationRule } from "./missing-token-authority-validation-rule";

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
