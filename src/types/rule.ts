import type { Finding } from "./finding";
import type { ParsedFile } from "./parsed-file";
import type { ProjectIndex } from "../parser/project-index";

export type Severity = "low" | "medium" | "high" | "critical";

export interface Rule {
  id: string;
  title: string;
  severity: Severity;
  description: string;
  fixGuidance: string;
  match: (file: ParsedFile, projectIndex?: ProjectIndex) => Finding[];
}
