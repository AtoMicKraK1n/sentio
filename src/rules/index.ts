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
import { accountInfoDataAccountRule } from "./anchor/accountinfo-data-account-rule";
import { missingHasOneRule } from "./anchor/missing-has-one-rule";
import { missingPdaSeedsBumpRule } from "./anchor/missing-pda-seeds-bump-rule";
import { sharedPdaAcrossAuthorityDomainsRule } from "./anchor/shared-pda-across-authority-domains-rule";
import { pdaSeedCollisionRiskRule } from "./anchor/pda-seed-collision-risk-rule";
import { missingMutOnModifiedAccountsRule } from "./anchor/missing-mut-on-modified-accounts-rule";
import { initIfNeededUsageRule } from "./anchor/init-if-needed-usage-rule";
import { missingCloseOnDisposableAccountsRule } from "./anchor/missing-close-on-disposable-accounts-rule";
import { missingReallocZeroTrueRule } from "./anchor/missing-realloc-zero-true-rule";
import { missingConstraintForUniquenessRule } from "./anchor/missing-constraint-for-uniqueness-rule";
import { accountInfoAsCpiTargetProgramRule } from "./anchor/accountinfo-as-cpi-target-program-rule";
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
  accountInfoDataAccountRule,
  missingHasOneRule,
  missingPdaSeedsBumpRule,
  sharedPdaAcrossAuthorityDomainsRule,
  pdaSeedCollisionRiskRule,
  missingMutOnModifiedAccountsRule,
  initIfNeededUsageRule,
  missingCloseOnDisposableAccountsRule,
  missingReallocZeroTrueRule,
  missingConstraintForUniquenessRule,
  accountInfoAsCpiTargetProgramRule,
  unsafeArithmeticCastRule,
];

export function createRuleRegistry(): Rule[] {
  return defaultRules;
}
