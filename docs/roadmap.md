# Roadmap

## Phase 0 — MVP

- capability definition;
- effect model;
- confirmation invariant;
- kill switch;
- audit events;
- WebMCP adapter;
- demo and tests.

## Phase 1 — developer experience

- runtime JSON Schema validation;
- React lifecycle helpers;
- capability namespaces/route ownership;
- richer audit context without leaking inputs;
- browser inspector overlay;
- CLI: inspect / validate / export manifest;
- WebMCP eval fixtures.

## Phase 2 — scanner + CI

Build a GNOSIX Agent Readiness scanner around evidence:

```text
URL / preview
  ↓
machine foundation
  ↓
WebMCP inventory
  ↓
effects / confirmation / trust
  ↓
security exposure checks
  ↓
regression comparison
  ↓
JSON + Markdown + CI result
```

Hosted value can include history, deploy alerts, policy packs, organization inventory and benchmarks.

## Phase 3 — interoperability

- server-side MCP adapter;
- A2A Agent Card/skill mapping research;
- capability identity/version negotiation;
- auth scopes/data classification;
- conformance tests per adapter.

## Phase 4 — commerce

Do not bolt payments directly onto WebMCP. Add a dedicated commerce layer:

- quote / cart / checkout intent separation;
- UCP mapping when appropriate;
- AP2/payment authorization experiments;
- explicit human authorization receipt;
- idempotency;
- replay protection;
- signed evidence;
- refund/cancel semantics;
- budget/merchant policy.

## Phase 5 — generated UI

Explore capabilities + user intent + policy as input to temporary confirmation/review interfaces. A2UI/AG-UI are research references, not v0.1 dependencies.

## Phase 6 — ecosystem

Possible outcomes:

- widely used open-source runtime;
- neutral contract proposal informed by actual usage;
- GNOSIX enterprise Agent Readiness layer;
- hosted scanner/governance SaaS;
- verified capability registry;
- CI/CD for agent surfaces;
- commerce authorization gateway.
