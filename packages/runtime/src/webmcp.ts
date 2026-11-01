import { buildManifest, toManifestEntry } from "./core.js";
import { executeWithPolicy } from "./policy.js";
import type { AuditEvent, CapabilityDefinition, RuntimePolicy } from "./types.js";

export interface WebMCPToolAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
  consequentialHint?: boolean;
  debugging?: boolean;
}

export interface WebMCPToolDefinition {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: WebMCPToolAnnotations;
  execute: (input: Record<string, unknown>, options: { signal: AbortSignal }) => Promise<unknown>;
}

export interface WebMCPModelContext {
  registerTool(
    tool: WebMCPToolDefinition,
    options?: { signal?: AbortSignal; exposedTo?: string[] },
  ): Promise<void>;
  getTools?(): Promise<unknown[]>;
}

export interface WebMCPDocumentLike {
  modelContext?: WebMCPModelContext;
  location?: { origin?: string };
}

export interface RegisterWebMCPOptions {
  document?: WebMCPDocumentLike;
  policy?: RuntimePolicy;
  /** Deliberately opt-in. Cross-origin exposure is disabled by default. */
  exposedTo?: string[];
}

export interface WebMCPRegistration {
  supported: boolean;
  registered: string[];
  manifest: ReturnType<typeof buildManifest>;
  stop: () => void;
}

async function emit(policy: RuntimePolicy | undefined, event: AuditEvent): Promise<void> {
  await policy?.audit?.(event);
}

function getDefaultDocument(): WebMCPDocumentLike | undefined {
  if (typeof document === "undefined") return undefined;
  return document as unknown as WebMCPDocumentLike;
}

export function toWebMCPAnnotations(capability: CapabilityDefinition): WebMCPToolAnnotations {
  const manifest = toManifestEntry(capability);
  return {
    readOnlyHint: manifest.effect === "read",
    untrustedContentHint: manifest.outputTrust !== "trusted",
    consequentialHint: manifest.effect === "consequential" || manifest.effect === "payment",
    debugging: false,
  };
}

export async function registerWebMCP(
  capabilities: readonly CapabilityDefinition[],
  options: RegisterWebMCPOptions = {},
): Promise<WebMCPRegistration> {
  const manifest = buildManifest(capabilities);
  const targetDocument = options.document ?? getDefaultDocument();
  const modelContext = targetDocument?.modelContext;
  const controllers: AbortController[] = [];
  const registered: string[] = [];

  if (!modelContext?.registerTool) {
    for (const capability of capabilities) {
      await emit(options.policy, {
        type: "registration.skipped",
        capabilityId: capability.id,
        adapter: "webmcp",
        timestamp: new Date().toISOString(),
        metadata: { reason: "document.modelContext_unavailable" },
      });
    }
    return { supported: false, registered, manifest, stop: () => undefined };
  }

  for (const capability of capabilities) {
    const controller = new AbortController();
    controllers.push(controller);
    const tool: WebMCPToolDefinition = {
      name: capability.name,
      title: capability.title,
      description: capability.description,
      inputSchema: capability.inputSchema,
      annotations: toWebMCPAnnotations(capability),
      execute: async (input, executionOptions) =>
        executeWithPolicy(
          capability,
          input,
          { signal: executionOptions.signal, origin: targetDocument?.location?.origin },
          options.policy,
        ),
    };
    const registrationOptions: { signal: AbortSignal; exposedTo?: string[] } = { signal: controller.signal };
    if (options.exposedTo?.length) registrationOptions.exposedTo = [...options.exposedTo];
    await modelContext.registerTool(tool, registrationOptions);
    registered.push(capability.name);
    await emit(options.policy, {
      type: "registration.succeeded",
      capabilityId: capability.id,
      adapter: "webmcp",
      timestamp: new Date().toISOString(),
    });
  }

  return {
    supported: true,
    registered,
    manifest,
    stop: () => { for (const controller of controllers) controller.abort(); },
  };
}
