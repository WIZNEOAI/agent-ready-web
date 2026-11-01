# Standards Registry

Adapter assumptions must be versioned here before code changes.

| Surface | Status used here | Version/date checked | Role |
|---|---|---:|---|
| WebMCP | W3C Community Group draft; not Recommendation | 27 Oct 2026 | browser tool exposure |
| Chromium WebMCP | early preview | checked Nov 2026 | implementation target |
| MCP | external protocol | mapping TBD | future server adapter |
| A2A | open protocol | latest released 1.0.0 checked Nov 2026 | future agent-to-agent mapping |
| UCP | open commerce protocol | v2026-08-25 checked Nov 2026 | future commerce mapping |
| AP2 | agent payment protocol/research | checked Nov 2026 | future authorization experiments |

## WebMCP

- https://webmachinelearning.github.io/webmcp/
- https://developer.chrome.com/docs/ai/webmcp
- https://developer.chrome.com/docs/modern-web-guidance/guides/webmcp/webmcp

Current adapter assumption:

```text
document.modelContext.registerTool(tool, { signal, exposedTo? })
tool = { name, title?, description, inputSchema?, execute, annotations? }
annotations = { readOnlyHint, untrustedContentHint, consequentialHint, debugging }
```

## A2A

- https://a2a-protocol.org/latest/
- https://github.com/a2aproject/A2A

No A2A adapter ships in v0.1.

## UCP

- https://ucp.dev/

No UCP adapter ships in v0.1.

## Change policy

When a tracked standard changes:

1. update this registry;
2. add/update compatibility tests;
3. modify only the adapter when possible;
4. change the core contract only if its semantic model is insufficient.
