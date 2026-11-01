# Security Model v0.1

## Threat model

1. **Intent can be misrepresented.** A description may not match actual behavior.
2. **Authenticated browser state carries authority.** Tool calls may run with user cookies/session.
3. **Outputs can contain prompt injection.** External/UGC data can manipulate later agent reasoning.
4. **Human and agent paths can drift.** A tool path may accidentally skip validation present in the UI.

## Trust boundary

```text
Agent
  ↓ untrusted intent/arguments
WebMCP adapter
  ↓
Agent Ready policy
  ↓ effect + confirmation + kill switch
Product service
  ↓ MUST authorize again server-side
System of record / external side effect
```

## Enforced in v0.1

- consequential/payment cannot declare `confirmation: none`;
- no confirmation handler means deny;
- global kill switch can deny execution;
- output trust maps to protocol hints;
- registration can be stopped cleanly;
- cross-origin exposure is opt-in.

## Not enforceable by this runtime alone

- whether code behavior matches the natural-language description;
- server object ownership;
- authentication strength;
- payment authorization;
- replay/fraud controls;
- whether output data is actually safe;
- whether the calling agent is compromised.

Those remain application responsibilities.

## Payment rule

Future payment adapters should model quote → intent → authorization → execution → receipt. Never put raw payment credentials in generic agent arguments.
