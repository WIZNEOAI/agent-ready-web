# Landscape — November 2026

This file prevents accidental duplication.

## Existing lower layers

### WebMCP specification
Defines the browser-native tool surface. This project consumes it; it does not replace it.

### GoogleChromeLabs/webmcp-tools
Inspector, evals, skills and developer utilities. Interoperate rather than clone.

### MCP-B / WebMCP-org
Polyfills/bridges WebMCP and MCP, plus framework integrations.

### WebMCP SDKs
Several projects already make registration/hooks/testing ergonomic.

### Nekuda WebMCP Kit
Coding-agent workflow that reads a repo, proposes/implements tools and verifies them.

### Sodium / Result
Commercial direction around analyzing a repository and publishing/managing generated WebMCP tools.

## Gap targeted here

Agent Ready Web is not primarily a generator.

It targets a durable product layer:

```text
capability semantics
+ effect classification
+ output trust
+ human confirmation
+ kill switch
+ audit evidence
+ protocol adapters
```

That layer compounds when the same business action must appear through browser agents, remote agents, commerce protocols and payment authorization systems.

## Rule

If another project solves a lower layer well, integrate it. Build the missing governance/contract/evidence layer instead.
