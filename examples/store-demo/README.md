# Store Demo

A deliberately small e-commerce-style demo showing one product with two interfaces:

- normal human UI;
- structured agent capabilities through WebMCP when the browser supports it.

Capabilities:

- `catalog.search` — read;
- `cart.get` — read;
- `cart.add` — write;
- `orders.place-demo` — consequential, explicit confirmation required.

The order is fake and never charges money. This is intentional: the demo teaches the safety boundary before real commerce integration.

Run from repository root:

```bash
npm install
npm run demo
```
