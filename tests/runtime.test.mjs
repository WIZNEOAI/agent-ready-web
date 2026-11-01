import test from "node:test";
import assert from "node:assert/strict";
import {
  CapabilityDeniedError,
  defineCapability,
  executeWithPolicy,
  registerWebMCP,
  toWebMCPAnnotations,
} from "../packages/runtime/dist/index.js";

const readCap = defineCapability({
  id: "catalog.search",
  version: "0.1.0",
  name: "search_catalog",
  title: "Search catalog",
  description: "Search the demo catalog.",
  inputSchema: { type: "object", properties: { query: { type: "string" } } },
  effect: "read",
  execute: async ({ query }) => ({ query, hits: 1 }),
});

test("read capability maps to safe WebMCP hints", () => {
  assert.deepEqual(toWebMCPAnnotations(readCap), {
    readOnlyHint: true,
    untrustedContentHint: false,
    consequentialHint: false,
    debugging: false,
  });
});

test("consequential capability cannot opt out of confirmation", () => {
  assert.throws(() =>
    defineCapability({
      id: "orders.place",
      version: "0.1.0",
      name: "place_order",
      description: "Place an order.",
      inputSchema: { type: "object" },
      effect: "consequential",
      confirmation: "none",
      execute: async () => ({ ok: true }),
    }),
  );
});

test("consequential execution is denied without a confirmation handler", async () => {
  const cap = defineCapability({
    id: "orders.place",
    version: "0.1.0",
    name: "place_order",
    description: "Place a fake demo order.",
    inputSchema: { type: "object" },
    effect: "consequential",
    execute: async () => ({ ok: true }),
  });
  await assert.rejects(() => executeWithPolicy(cap, {}), CapabilityDeniedError);
});

test("consequential execution succeeds after explicit confirmation", async () => {
  const cap = defineCapability({
    id: "orders.place",
    version: "0.1.0",
    name: "place_order",
    description: "Place a fake demo order.",
    inputSchema: { type: "object" },
    effect: "consequential",
    execute: async () => ({ ok: true }),
  });
  const result = await executeWithPolicy(cap, {}, {}, { confirm: async () => true });
  assert.deepEqual(result, { ok: true });
});

test("WebMCP adapter registers tools and aborts registrations on stop", async () => {
  const registered = [];
  const signals = [];
  const fakeDocument = {
    location: { origin: "https://demo.example" },
    modelContext: {
      async registerTool(tool, options) {
        registered.push(tool);
        signals.push(options.signal);
      },
    },
  };

  const registration = await registerWebMCP([readCap], { document: fakeDocument });
  assert.equal(registration.supported, true);
  assert.deepEqual(registration.registered, ["search_catalog"]);
  assert.equal(signals[0].aborted, false);
  registration.stop();
  assert.equal(signals[0].aborted, true);
});
