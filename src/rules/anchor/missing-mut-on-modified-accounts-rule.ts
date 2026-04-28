import type { Finding } from "../../types/finding";
import type { Rule } from "../../types/rule";
import { createFinding } from "../utils";

export const missingMutOnModifiedAccountsRule: Rule = {
  id: "SW016",
  title: "Missing mut on modified accounts",
  severity: "medium",
  description:
    "Detects accounts that appear to be written/updated in instruction logic but are not marked `mut` in the corresponding account constraints.",
  fixGuidance:
    "Mark writable accounts as `#[account(mut)]` (or include `mut` in the account constraint list) whenever their lamports/data/state are modified.",

  match(file) {
    const findings: Finding[] = [];

    const source = file.source;

    //collect account fields declared in #[derive(Accounts)] structs
    const fieldRegex =
      /^\s*pub\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(?:Account|InterfaceAccount|AccountLoader|Signer|SystemAccount|UncheckedAccount|Program|Box<\s*Account)[^,\n]*,?/gm;

    const accountFields = new Set<string>();
    for (const m of source.matchAll(fieldRegex)) {
      if (m[1]) {
        accountFields.add(m[1]);
      }
    }

    if (accountFields.size === 0) return findings;

    //find fields that are likely modified in handlers
    const modifiedFields = new Set<string>();

    for (const field of accountFields) {
      const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const writeLikePatterns = [
        new RegExp(
          `\\bctx\\.accounts\\.${escaped}\\.[a-zA-Z_][a-zA-Z0-9_]*\\s*=`,
          "g",
        ),
        new RegExp(
          `\\b\\*\\s*ctx\\.accounts\\.${escaped}\\.[a-zA-Z_][a-zA-Z0-9_]*\\s*=`,
          "g",
        ),
        new RegExp(`\\bctx\\.accounts\\.${escaped}\\.set_inner\\s*\\(`, "g"),
        new RegExp(`\\bctx\\.accounts\\.${escaped}\\.reload\\s*\\(`, "g"),
        new RegExp(
          `\\bctx\\.accounts\\.${escaped}\\.to_account_info\\s*\\(\\)\\s*\\.lamports\\s*\\(`,
          "g",
        ),
        new RegExp(`\\bctx\\.accounts\\.${escaped}\\.sub_lamports\\s*\\(`, "g"),
        new RegExp(`\\bctx\\.accounts\\.${escaped}\\.add_lamports\\s*\\(`, "g"),
      ];

      if (writeLikePatterns.some((re) => re.test(source))) {
        modifiedFields.add(field);
      }
    }

    if (modifiedFields.size === 0) return findings;

    //verify each modified field has mut in nearby #[account(...)] attr
    for (const field of modifiedFields) {
      const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const fieldDeclRegex = new RegExp(
        `(^|\\n)\\s*pub\\s+${escaped}\\s*:\\s*[^\\n]+`,
        "m",
      );
      const declMatch = source.match(fieldDeclRegex);
      if (!declMatch || declMatch.index == null) continue;

      const declIndex = declMatch.index;

      // Scan a window before declaration for #[account(...)]
      const windowStart = Math.max(0, declIndex - 600);
      const beforeDecl = source.slice(windowStart, declIndex);

      const accountAttrMatches = [
        ...beforeDecl.matchAll(/#\s*\[\s*account\s*\(([\s\S]*?)\)\s*\]/g),
      ];
      const lastAttr = accountAttrMatches.length
        ? accountAttrMatches[accountAttrMatches.length - 1]
        : null;

      const hasMut = !!lastAttr && /\bmut\b/.test(lastAttr[1] ?? "");

      if (hasMut) continue;

      findings.push(
        createFinding({
          ruleId: "SW016",
          severity: "medium",
          message: `Account \`${field}\` appears to be modified but is not marked \`mut\` in account constraints.`,
          file: file.path,
          source: file.source,
          index: declIndex,
          fixGuidance: `Add \`mut\` to the account constraint for \`${field}\` (for example \`#[account(mut, ...)]\`) if it is writable.`,
        }),
      );
    }

    return findings;
  },
};
