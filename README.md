# SolWarden

SDK + CLI scanner for common Solana programs vulnerability patterns.

SolWarden helps you quickly scan Anchor/native Solana Rust code for risky patterns and get actionable findings with severity, file location, and fix guidance.

## Install (Global)

Global install is required to use `solwarden` directly in terminal.

### npm

```bash
npm i -g solwarden
```

### bun

```bash
bun add -g solwarden
```

## Usage

### Scan a project

```bash
solwarden scan .
```

### Scan a specific path

```bash
solwarden scan /path/to/project
```

### Output formats

```bash
# Human-readable output (default)
solwarden scan . --format human

# JSON output (for CI / scripts)
solwarden scan . --format json
```

### List rules

```bash
solwarden rules list
```

## Rule IDs (SW = SolWarden)

`SW` means **SolWarden rule**.

- **SW001**: Missing signer or pubkey-only authority validation  
  Detects authority checks that rely on pubkey comparison without signer enforcement.

- **SW002**: Missing owner check on deserialization  
  Detects deserialization paths without nearby owner validation.

- **SW003**: Arbitrary CPI target risk  
  Detects CPI invocation patterns without nearby target program ID validation.

- **SW004**: Non-canonical PDA derivation risk  
  Detects non-canonical PDA usage patterns (for example user-influenced bump/derivation risks).

- **SW005**: Unsafe arithmetic or narrowing cast  
  Detects unchecked arithmetic and potentially dangerous `as` casts.

- **SW006**: Missing account discriminator validation  
  Detects account deserialization paths without nearby discriminator checks.

- **SW007**: Unchecked account usage without validation  
  Detects critical `UncheckedAccount`/`AccountInfo` usage without nearby owner/signer/seeds/address constraints.

- **SW008**: Missing post-CPI account reload  
  Detects CPI contexts where accounts may be used after mutation without reload/refresh.

- **SW009**: Missing token mint validation  
  Detects SPL token account usage without explicit expected-mint validation.

- **SW010**: Missing token authority validation  
  Detects token operations without explicit authority/owner signer validation.

## Exit behavior

- Exit code `0`: scan completed with no findings
- Exit code `1`: findings detected
- Exit code `2`: tool/usage error

## Troubleshooting

### `solwarden: command not found`

If you installed with Bun globally, ensure Bun bin path is in your shell PATH:

```bash
export PATH="$HOME/.bun/bin:$PATH"
```

Then restart your terminal.

### Use without global install (optional)

```bash
bunx solwarden scan .
```

## Who is this for?

- Solana program developers
- Audit preparation workflows
- CI pipelines that need quick static checks before deeper review

---

If you find a false positive/negative, open an issue with:

- contract snippet,
- expected behavior,
- actual SolWarden output.

---
