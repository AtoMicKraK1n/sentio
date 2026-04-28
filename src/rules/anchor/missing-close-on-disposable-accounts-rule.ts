import type { Rule } from "../../types/rule";
import { createFinding, nearbyHasPattern } from "../utils";

export const missingCloseOnDisposableAccountsRule: Rule = {
  id: "SW018",
  title: "Missing close on disposable accounts",
  severity: "medium",
  description:
    "Detects likely disposable/temp accounts that are initialized but not obviously closed, which can leave rent stranded and stale state lingering.",
  fixGuidance:
    "For short-lived/disposable accounts, add `close = <recipient>` in account constraints or an explicit close flow after use.",

  match(file) {
    const findings = [];
    const lines = file.source.split("\n");

    const accountAttrRegex = /#\s*\[\s*account\s*\(([\s\S]*?)\)\s*\]/g;

    for (const match of file.source.matchAll(accountAttrRegex)) {
      const fullAttr = match[0];
      const inner = match[1] ?? "";
      const idx = match.index ?? 0;
      const lineNo = file.source.slice(0, idx).split("\n").length - 1;
      const isInitializedHere = /\b(init|init_if_needed)\b/.test(inner);

      if (!isInitializedHere) continue;
      const hasClose = /\bclose\s*=/.test(inner);
      if (hasClose) continue;

      //likely disposable by naming/context
      const disposableSignal =
        /\b(temp|tmp|ephemeral|transient|session|receipt|voucher|ticket|nonce|scratch|buffer|pending|staging|bridge|escrow)\b/i.test(
          inner,
        ) ||
        /\b(temp|tmp|ephemeral|transient|session|receipt|voucher|ticket|nonce|scratch|buffer|pending|staging|bridge|escrow)\b/i.test(
          fullAttr,
        );

      const hasLongLivedJustification = nearbyHasPattern(
        lines,
        lineNo,
        3,
        /long[-\s]?lived|persistent|do\s+not\s+close|kept\s+open|state\s+account/i,
      );

      if (!disposableSignal || hasLongLivedJustification) continue;

      findings.push(
        createFinding({
          ruleId: "SW018",
          severity: "medium",
          message:
            "Likely disposable account is initialized without an obvious `close = ...` constraint.",
          file: file.path,
          source: file.source,
          index: idx,
          fixGuidance:
            "If this account is short-lived, add `close = <recipient>` (and appropriate authority checks) to reclaim rent and prevent stale state buildup.",
        }),
      );
    }

    return findings;
  },
};
