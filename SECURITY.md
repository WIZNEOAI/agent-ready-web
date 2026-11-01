# Security Policy

Agent Ready Web is security-sensitive infrastructure because it exposes product capabilities to software agents.

## Core position

A structured agent call must **not** receive more authority than the signed-in human already has through the product.

WebMCP annotations communicate intent. They do not prove behavior and do not replace application authorization.

## Production rules

- Reuse the same server authorization, validation, rate limits and ownership checks as the human UI.
- Never put secrets in tool metadata or browser-visible handlers.
- Mark outputs containing external/user-generated content as untrusted.
- Require explicit human approval for consequential and payment effects.
- Use idempotency keys for transaction-like operations.
- Log capability ID/version, authorization decision, confirmation and outcome without unnecessary sensitive inputs.
- Keep a kill switch.
- Avoid cross-origin exposure unless explicitly threat-modeled.
- Treat prompt injection in tool outputs as an application-security problem.

## Payments

Do not pass raw card data through generic agent tools. Future payment adapters should use purpose-built payment intents/mandates/authorization objects, explicit human approval, server validation, idempotency and signed evidence where available.
