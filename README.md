# ⚠️ Deprecated — sentio (npm)

<p align="center">
  <a href="https://www.npmjs.com/package/sentio">
    <img src="https://img.shields.io/npm/v/sentio?color=cb3837&label=sentio&logo=sentio" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/sentio">
    <img src="https://img.shields.io/npm/dm/sentio?color=brightgreen&label=downloads" alt="npm downloads" />
  </a>
  <a href="https://www.npmjs.com/package/sentio">
    <img src="https://img.shields.io/npm/l/sentio" alt="license" />
  </a>
</p>

> **This package is no longer maintained.**
>
> sentio has moved to a native Rust CLI — faster, more accurate, and actively developed.
> Install the current version with:
>
> ```bash
> cargo install sentio-cli
> ```
>
> → [crates.io/crates/sentio-cli](https://crates.io/crates/sentio-cli)  
> → [github.com/sentio-security/sentio-rs](https://github.com/sentio-security/sentio-rs)

---

The npm package will not receive further updates. The Rust CLI covers everything the npm version did and significantly more — 22 rules, Anchor constraint modeling, function-scoped suppressions, JSON output, and CI-ready exit codes.

If you have `sentio` installed globally via npm or bun, uninstall it and switch:

```bash
# remove old
npm uninstall -g sentio
# or
bun remove -g sentio

# install current
cargo install sentio-cli
```

---

## What moved to the Rust CLI

| npm `sentio`        | Rust `sentio-cli`                               |
| ------------------- | ----------------------------------------------- |
| `sentio scan .`     | `sentio scan .`                                 |
| `--format json`     | `--format json`                                 |
| `sentio rules list` | `sentio rules list`                             |
| SW001–SW020         | SW001–SW027 (22 rules, more in progress)        |
| inline suppression  | inline + next-line + function-scope suppression |

Same CLI feel, much deeper analysis.
