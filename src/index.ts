import { extractParsedFiles } from "./parser/extract";
import { reportHuman } from "./reporter/human";
import { reportJson } from "./reporter/json";
import { runRules } from "./rule-engine/engine";
import { createRuleRegistry } from "./rule-engine/registry";

export async function scanPath(targetPath: string) {
  const files = await extractParsedFiles(targetPath);
  const rules = createRuleRegistry();
  return runRules(files, rules);
}

export { reportHuman, reportJson, createRuleRegistry };
