import {
  buildManifest,
  defineCapability,
  executeWithPolicy,
  registerWebMCP,
} from "../../packages/runtime/dist/index.js";

const catalog = [
  { sku: "BB-AI", name: "AI Engineer Blackbook", price: 49 },
  { sku: "BB-CODE", name: "AI Coding Blackbook", price: 49 },
  { sku: "LAB", name: "Agentic Web Lab Pass", price: 29 },
  { sku: "KIT", name: "Harness Starter Kit", price: 19 },
];
const cart = new Map();
let runtimeEnabled = true;
const logEl = document.querySelector("#log");
const statusEl = document.querySelector("#status");
const dotEl = document.querySelector("#statusDot");

function log(value) {
  logEl.textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function cartSummary() {
  const lines = [...cart.entries()].map(([sku, quantity]) => {
    const item = catalog.find((entry) => entry.sku === sku);
    return { ...item, quantity, subtotal: item.price * quantity };
  });
  return { items: lines, total: lines.reduce((sum, item) => sum + item.subtotal, 0) };
}

function render() {
  const products = document.querySelector("#products");
  products.innerHTML = catalog.map((item) => `
    <div class="product">
      <strong>${item.name}</strong>
      <p class="muted">${item.sku} · $${item.price}</p>
      <button data-sku="${item.sku}">Add to cart</button>
    </div>`).join("");
  products.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
    const sku = button.dataset.sku;
    cart.set(sku, (cart.get(sku) ?? 0) + 1);
    updateCart();
  }));
  updateCart();
}

function updateCart() {
  const summary = cartSummary();
  const count = summary.items.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector("#cart").textContent = `Cart: ${count} items · $${summary.total}`;
}

const capabilities = [
  defineCapability({
    id: "catalog.search",
    version: "0.1.0",
    name: "search_catalog",
    title: "Search catalog",
    description: "Search this store's public catalog by product name or SKU.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Product name or SKU fragment." } },
      required: ["query"],
      additionalProperties: false,
    },
    effect: "read",
    execute: async ({ query }) => ({
      results: catalog.filter((item) => `${item.name} ${item.sku}`.toLowerCase().includes(String(query).toLowerCase())),
    }),
  }),
  defineCapability({
    id: "cart.get",
    version: "0.1.0",
    name: "get_cart",
    title: "Get cart",
    description: "Return the user's current demo cart and total.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    effect: "read",
    execute: async () => cartSummary(),
  }),
  defineCapability({
    id: "cart.add",
    version: "0.1.0",
    name: "add_to_cart",
    title: "Add to cart",
    description: "Add an item to the user's demo cart. This changes only local demo state and does not place an order.",
    inputSchema: {
      type: "object",
      properties: {
        sku: { type: "string", description: "Exact SKU from the catalog." },
        quantity: { type: "integer", minimum: 1, maximum: 10, default: 1 },
      },
      required: ["sku"],
      additionalProperties: false,
    },
    effect: "write",
    execute: async ({ sku, quantity = 1 }) => {
      if (!catalog.some((item) => item.sku === sku)) throw new Error("Unknown SKU");
      cart.set(sku, (cart.get(sku) ?? 0) + Number(quantity));
      updateCart();
      return cartSummary();
    },
  }),
  defineCapability({
    id: "orders.place-demo",
    version: "0.1.0",
    name: "place_demo_order",
    title: "Place demo order",
    description: "Create a fake local order from the current demo cart. No money is charged. Explicit human confirmation is still required because this models a consequential action.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    effect: "consequential",
    execute: async () => ({ orderId: `DEMO-${Date.now()}`, charged: false, ...cartSummary() }),
  }),
];

const audit = [];
const policy = {
  enabled: () => runtimeEnabled,
  confirm: async ({ capability }) => window.confirm(`Allow agent action: ${capability.title ?? capability.name}?`),
  audit: (event) => {
    audit.push(event);
    console.debug("[agent-ready]", event);
  },
};

render();
const registration = await registerWebMCP(capabilities, { policy });
if (registration.supported) {
  statusEl.textContent = `${registration.registered.length} WebMCP tools registered`;
  dotEl.classList.add("ok");
} else {
  statusEl.textContent = "WebMCP unavailable — human UI still works";
}
log({ supported: registration.supported, registered: registration.registered, note: "Enable current Chromium WebMCP preview to expose native tools." });

document.querySelector("#inspect").addEventListener("click", () => log(buildManifest(capabilities)));
document.querySelector("#fakeOrder").addEventListener("click", async () => {
  try {
    const result = await executeWithPolicy(capabilities.at(-1), {}, {}, policy);
    log({ result, recentAudit: audit.slice(-5) });
  } catch (error) {
    log({ error: error.message, recentAudit: audit.slice(-5) });
  }
});

window.__agentReadyDemo = { capabilities, registration, policy, setEnabled(value) { runtimeEnabled = Boolean(value); } };
