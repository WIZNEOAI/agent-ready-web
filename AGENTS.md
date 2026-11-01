# AGENTS.md — Agent Ready Web

## Mission

Build a protocol-neutral capability contract and safe runtime that can expose product capabilities through WebMCP today and additional agent protocols later.

## Non-negotiable rules

1. Read the current WebMCP draft before changing adapter semantics.
2. Never claim this project is an official W3C, MCP, A2A, UCP, AP2, Google, Microsoft, Anthropic or OpenAI standard.
3. Keep product capability semantics independent from adapters.
4. Never weaken confirmation for `consequential` or `payment` effects.
5. WebMCP annotations are hints, not authorization.
6. Require the same server-side authorization/validation used by the human UI.
7. No cross-origin WebMCP exposure by default.
8. No secrets, API keys, card data or privileged tokens in browser-visible code/logs.
9. Prefer additive adapters over changing core semantics for one vendor.
10. Every behavior change needs tests and docs.

## Before coding

```text
Observed → Standard delta → Security impact → Smallest compatible change → Tests
```

## Definition of done

- `npm run check` passes.
- API changes are documented.
- Security invariants remain intact.
- Demo works when `document.modelContext` is absent.
- Protocol-dependent changes update `docs/standards-registry.md`.
