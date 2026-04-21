import { Command } from "commander";
import { scanPath, reportHuman, reportJson, createRuleRegistry } from "./index";

const program = new Command();

program.name("solwarden").description("SolWarden SDK/CLI (v0 scaffold)");

program
  .command("scan")
  .argument("<path>", "workspace path to scan")
  .option("-f, --format <format>", "output format: human|json", "human")
  .action(async (pathArg: string, options: { format: string }) => {
    const result = await scanPath(pathArg);

    if (options.format === "json") {
      console.log(reportJson(result));
      return;
    }

    console.log(reportHuman(result));
  });

program
  .command("rules")
  .argument("<action>", "supported: list")
  .action((action: string) => {
    if (action !== "list") {
      console.error(`Unsupported rules action: ${action}`);
      process.exit(1);
    }

    const rules = createRuleRegistry();
    if (rules.length === 0) {
      console.log("No rules registered yet.");
      return;
    }

    for (const rule of rules) {
      console.log(`${rule.id} | ${rule.severity} | ${rule.title}`);
    }
  });

export async function runCli(argv = process.argv): Promise<void> {
  await program.parseAsync(argv);
}
