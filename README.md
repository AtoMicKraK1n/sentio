# SolWarden (codewarden)

SDK + CLI scanner for common Solana smart contract vulnerability patterns.

## Install

```bash
bun install
```

## Commands

### Scan

```bash
# Scan current directory (human-readable)
bun run scan .

# Scan specific path
bun run scan ./fixtures/programs/fixtures

# JSON output (for CI/scripts)
bun run scan . --format json

# Human output (explicit)
bun run scan . --format human
```

### Rules

```bash
# List all registered rules
bun run rules
# (alias used internally by CLI: bun run index.ts rules list)
```

### Dev checks

```bash
# TypeScript type check
bun run typecheck
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
  Detects critical `UncheckedAccount`/`AccountInfo` usage without nearby owner/signer/seeds constraints.

## Current status

- Point 1 locked (v0 scope)
- Point 2 scaffold complete (parser, rule-engine, rules, reporter)
- Point 3 minimal contracts complete
- Point 4 in progress (rule expansion)
- Batch 1 implemented: SW001, SW002, SW006, SW007
