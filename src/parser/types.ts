import type { ParsedFile } from "../types/parsed-file";

export interface ExtractOptions {
  include?: string[];
  ignore?: string[];
}

export type ParserOutput = ParsedFile[];
