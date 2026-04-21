import { readFile } from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import type { ParsedFile } from "../types/parsed-file";
import type { ExtractOptions } from "./types";

const DEFAULT_INCLUDE = ["**/*.rs"];
const DEFAULT_IGNORE = ["**/node_modules/**", "**/target/**", "**/.git/**"];

export async function extractParsedFiles(
  targetPath: string,
  options: ExtractOptions = {},
): Promise<ParsedFile[]> {
  const resolvedTarget = path.resolve(targetPath);
  const include = options.include ?? DEFAULT_INCLUDE;
  const ignore = options.ignore ?? DEFAULT_IGNORE;

  const files = await glob(include, {
    cwd: resolvedTarget,
    absolute: true,
    nodir: true,
    ignore,
  });

  const parsedFiles = await Promise.all(
    files.map(async (filePath) => {
      const source = await readFile(filePath, "utf8");
      return {
        path: filePath,
        source,
      } satisfies ParsedFile;
    }),
  );

  return parsedFiles;
}
