# Architecture

Agent Ready Web separates **what a product can do** from **how an agent protocol exposes it**.

```text
Domain action / product service
          ↓
Capability Contract
          ↓
Policy Runtime
  ├─ audit
  ├─ confirmation
  └─ kill switch
          ↓
Adapters
  ├─ WebMCP (implemented)
  ├─ MCP (planned)
  ├─ A2A (research)
  └─ UCP/AP2 (research)
```

## Capability Contract

A capability has stable semantics:

- `id`: adapter-independent key;
- `version`: semantic contract version;
- `name`: adapter-facing tool name;
- `description`: bounded intent;
- `inputSchema`: structured input;
- `effect`: `read | write | consequential | payment`;
- `outputTrust`: `trusted | untrusted | mixed`;
- `confirmation`: `none | required`;
- `execute`: product handler.

### Effects

**Read:** no product-state mutation.

**Write:** low-impact/reversible state mutation, e.g. adding to a cart.

**Consequential:** significant real-world or difficult-to-reverse action. Confirmation is mandatory in v0.1.

**Payment:** movement/authorization of money. Confirmation is mandatory; no real payment implementation ships in v0.1.

## WebMCP mapping

| Contract | WebMCP |
|---|---|
| `name` | `name` |
| `title` | `title` |
| `description` | `description` |
| `inputSchema` | `inputSchema` |
| `effect=read` | `readOnlyHint=true` |
| `effect=consequential/payment` | `consequentialHint=true` |
| `outputTrust!=trusted` | `untrustedContentHint=true` |
| handler | `execute()` |

Registration lifecycle uses a registration-time `AbortSignal`. Cross-origin `exposedTo` is opt-in.

## Why adapters absorb churn

WebMCP is still evolving. Product teams should not scatter `document.modelContext` calls across application code. The adapter is the compatibility boundary; product semantics should survive protocol API changes.

## Long-term outputs from one contract

- browser-native tools;
- server-side tools;
- agent skill descriptors;
- commerce capability metadata;
- eval fixtures;
- security inventory;
- audit/policy checks.

Mappings must be implemented only after target-protocol semantics are verified.
