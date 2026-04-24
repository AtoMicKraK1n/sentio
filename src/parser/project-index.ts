import type { ParsedFile } from "../types/parsed-file";

export interface EvidenceRef {
  file: string;
  line: number;
  snippet: string;
}

export interface ProjectIndex {
  files: ParsedFile[];
  signerEvidenceByFile: Map<string, EvidenceRef[]>;
  cpiEvidenceByFile: Map<string, EvidenceRef[]>;
  uncheckedAccountEvidenceByFile: Map<string, EvidenceRef[]>;
  reloadEvidenceByFile: Map<string, EvidenceRef[]>;
  ownerOrConstraintEvidenceByFile: Map<string, EvidenceRef[]>;
  mintOrAuthorityEvidenceByFile: Map<string, EvidenceRef[]>;
}

function findLine(source: string, idx: number): number {
  return source.slice(0, idx).split("\n").length;
}

function collectMatches(
  filePath: string,
  source: string,
  regex: RegExp,
): EvidenceRef[] {
  const out: EvidenceRef[] = [];
  for (const m of source.matchAll(regex)) {
    const index = m.index ?? 0;
    const line = findLine(source, index);
    const snippet = m[0].trim().slice(0, 220);
    out.push({ file: filePath, line, snippet });
  }
  return out;
}

export function buildProjectIndex(files: ParsedFile[]): ProjectIndex {
  const signerEvidenceByFile = new Map<string, EvidenceRef[]>();
  const cpiEvidenceByFile = new Map<string, EvidenceRef[]>();
  const uncheckedAccountEvidenceByFile = new Map<string, EvidenceRef[]>();
  const reloadEvidenceByFile = new Map<string, EvidenceRef[]>();
  const ownerOrConstraintEvidenceByFile = new Map<string, EvidenceRef[]>();
  const mintOrAuthorityEvidenceByFile = new Map<string, EvidenceRef[]>();

  for (const f of files) {
    const signer = collectMatches(
      f.path,
      f.source,
      /\bSigner\s*<\s*'info\s*>|\bis_signer\b|require!\s*\(.+is_signer/gs,
    );
    const cpi = collectMatches(
      f.path,
      f.source,
      /\binvoke_signed?\s*\(|\bCpiContext::new(?:_with_signer)?\s*\(|\btoken::[a-z_]+\s*\(/gs,
    );
    const unchecked = collectMatches(
      f.path,
      f.source,
      /\bUncheckedAccount\s*<\s*'info\s*>|\bAccountInfo\s*<\s*'info\s*>/gs,
    );
    const reload = collectMatches(f.path, f.source, /\.\s*reload\s*\(\s*\)/gs);
    const ownerOrConstraint = collectMatches(
      f.path,
      f.source,
      /\bowner\s*==|Account::try_from|try_deserialize|has_one\s*=|constraint\s*=|address\s*=/gs,
    );
    const mintOrAuthority = collectMatches(
      f.path,
      f.source,
      /\bmint\s*==|token::mint\s*=|authority\s*==|token::authority\s*=|owner\s*==/gs,
    );

    signerEvidenceByFile.set(f.path, signer);
    cpiEvidenceByFile.set(f.path, cpi);
    uncheckedAccountEvidenceByFile.set(f.path, unchecked);
    reloadEvidenceByFile.set(f.path, reload);
    ownerOrConstraintEvidenceByFile.set(f.path, ownerOrConstraint);
    mintOrAuthorityEvidenceByFile.set(f.path, mintOrAuthority);
  }

  return {
    files,
    signerEvidenceByFile,
    cpiEvidenceByFile,
    uncheckedAccountEvidenceByFile,
    reloadEvidenceByFile,
    ownerOrConstraintEvidenceByFile,
    mintOrAuthorityEvidenceByFile,
  };
}
