import type { Rule } from "../types/rule";
import { defaultRules } from "../rules/index";

export function createRuleRegistry(): Rule[] {
  return defaultRules;
}
