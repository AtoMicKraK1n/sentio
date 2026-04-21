# codewarden

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.3. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

### Folder responsibilities

- parser/ → read files, extract analyzable units
- rule-engine/ → run rules over parser output
- rules/ → rule modules only (one file per rule later)
- reporter/ → output formatting
- types/ → shared contracts
# solwarden
