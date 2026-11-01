# Contributing

Contributions are welcome, especially around standards tracking, adapters, security tests and reproducible evals.

Before a PR:

```bash
npm install
npm run check
```

For changes tied to a protocol draft, include:

- protocol/spec;
- version or publication date;
- source URL;
- adapter behavior changed;
- compatibility impact;
- security impact.

Avoid framework-specific dependencies in the core runtime unless they cannot live in an optional adapter.
