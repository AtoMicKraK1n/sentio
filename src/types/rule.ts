import type { Finding } from "./finding";
import type { ParsedFile } from "./parsed-file";

export interface Rule {
  id: string;
  title: string;
  description: string;
  severity: Finding["severity"];
  match(file: ParsedFile): Finding[];
}
