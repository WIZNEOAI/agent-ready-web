# Agent Ready Web

**One capability contract for the agentic web. Define once. Govern once. Expose safely.**

Agent Ready Web is an open-source runtime and design pattern for making web products usable by AI agents **without coupling business logic to one agent protocol**.

The first adapter targets **WebMCP** (`document.modelContext`). The contract is protocol-neutral so the same product capability can later map to server-side MCP, A2A, commerce protocols or payment authorization layers without rewriting the business action.

> **Status: MVP / research preview v0.1.** WebMCP is an evolving W3C Community Group draft, not a W3C Recommendation. Agent Ready Web is not an official standard.

## The idea

Most WebMCP tooling answers: **how do I register a tool?**

This project asks the next question:

> What is this capability allowed to do, how risky is it, who must approve it, what can an agent trust in the output, how is it audited, and how can the same capability survive multiple agent protocols?

```text
Product capability
      ↓
Agent Ready Capability Contract
  ├─ stable id + version
  ├─ input schema
  ├─ effect: read | write | consequential | payment
  ├─ output trust
  └─ confirmation requirement
      ↓
Policy Runtime
  ├─ kill switch
  ├─ human confirmation
  └─ audit events
      ↓
Adapter layer
  ├─ WebMCP  ← implemented
  ├─ MCP     ← roadmap
  ├─ A2A     ← roadmap/research
  └─ UCP/AP2 ← roadmap/research
```

## MVP

- `defineCapability()`: protocol-neutral capability definition.
- Explicit effects: `read`, `write`, `consequential`, `payment`.
- Consequential/payment capabilities cannot opt out of confirmation.
- `executeWithPolicy()`: confirmation gate, kill switch and audit events.
- `registerWebMCP()`: current `document.modelContext` adapter.
- WebMCP safety hints derived from capability semantics.
- No cross-origin exposure by default.
- Clean unregister lifecycle through `AbortController`.
- No-op fallback when WebMCP is unavailable; the human website still works.
- Deterministic manifest generation.
- Commerce-style demo with a fake consequential order.
- Automated tests.

## Quick start

```bash
npm install
npm run check
npm run demo
```

Then open `http://localhost:4173`.

## Example

```ts
import { defineCapability, registerWebMCP } from "@agent-ready/runtime";

const search = defineCapability({
  id: "catalog.search",
  version: "0.1.0",
  name: "search_catalog",
  title: "Search catalog",
  description: "Search the public product catalog.",
  inputSchema: {
    type: "object",
    properties: { query: { type: "string" } },
    required: ["query"],
    additionalProperties: false
  },
  effect: "read",
  execute: async ({ query }) => ({ results: await searchCatalog(query) })
});

await registerWebMCP([search]);
```

Consequential actions require explicit approval:

```ts
await registerWebMCP([placeOrder], {
  policy: {
    confirm: async ({ capability }) => showHumanConfirmation(capability),
    audit: event => sendToObservability(event),
    enabled: () => featureFlags.agentActionsEnabled
  }
});
```

Without a confirmation handler, a required-confirmation capability is denied.

## Current WebMCP assumptions

The adapter follows the **27 October 2026 WebMCP Community Group draft** shape:

- `document.modelContext.registerTool(...)`
- `name`, optional `title`, `description`, `inputSchema`, `execute`, `annotations`
- `readOnlyHint`, `untrustedContentHint`, `consequentialHint`, `debugging`
- registration-time `AbortSignal` controls tool availability

Verify the current draft before production use:

- https://webmachinelearning.github.io/webmcp/
- https://developer.chrome.com/docs/ai/webmcp

## Why not another WebMCP SDK?

There are already good SDKs, polyfills, inspectors, eval tools and repo-to-WebMCP generators.

Agent Ready Web intentionally sits **one layer above registration/generation**:

```text
capability semantics
+ effect classification
+ output trust
+ human confirmation
+ kill switch
+ audit evidence
+ multiple protocol adapters
```

If another project solves a lower layer well, integrate it instead of recreating it.

## Repository

```text
packages/runtime/        Capability Contract + policy + WebMCP adapter
examples/store-demo/     human UI + agent interface demo
tests/                   deterministic runtime tests
spec/                    experimental Capability Contract JSON Schema
docs/architecture.md     architecture
docs/security-model.md   trust boundaries
docs/standards-registry.md tracked standards
docs/roadmap.md          technical/product roadmap
docs/product-paths.md    open source + SaaS + GNOSIX paths
docs/landscape.md        ecosystem map / differentiation
AGENTS.md                instructions for coding agents
```

## Security posture

- Hints are not enforcement.
- Human and agent paths must share server-side authorization.
- Never expose secrets or payment credentials to generic browser tools.
- Mark untrusted outputs explicitly.
- Require confirmation for consequential/payment effects.
- Use idempotency and replay controls for real transactions.
- Keep a kill switch.
- Audit without logging unnecessary sensitive data.

Read [SECURITY.md](SECURITY.md) and [docs/security-model.md](docs/security-model.md).

## Product paths

The runtime is open source. Potential paid layers sit around it:

- GNOSIX Agent Readiness assessments and implementation.
- Hosted scanner / deploy regression monitoring.
- Organization-wide capability inventory.
- Policy packs, approvals and audit export.
- Conformance/eval history.
- Commerce/payment adapters after protocols mature.

See [docs/product-paths.md](docs/product-paths.md).

## Roadmap

**v0.1:** contract + policy + WebMCP + demo + tests.

**v0.2:** CLI, React helpers, runtime schema validation, inspector/eval integration.

**v0.3:** MCP adapter, A2A mapping research, auth/data policy vocabulary.

**v0.4:** commerce/payment intent contract, UCP/AP2 experiments, receipts/idempotency/replay controls.

**v1 candidate:** stable contract, conformance suite, hosted scanner and enterprise policies.

## License

Apache-2.0.
