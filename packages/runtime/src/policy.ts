import { toManifestEntry } from "./core.js";
import type { AuditEvent, CapabilityContext, CapabilityDefinition, RuntimePolicy } from "./types.js";

function isoNow(): string { return new Date().toISOString(); }
async function emit(policy: RuntimePolicy | undefined, event: AuditEvent): Promise<void> {
  await policy?.audit?.(event);
}

export class CapabilityDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CapabilityDeniedError";
  }
}

export async function executeWithPolicy(
  capability: CapabilityDefinition,
  input: Record<string, unknown>,
  context: CapabilityContext = {},
  policy?: RuntimePolicy,
): Promise<unknown> {
  if (policy?.enabled && !policy.enabled()) {
    throw new CapabilityDeniedError("Agent Ready runtime is disabled by policy");
  }

  const manifest = toManifestEntry(capability);
  const startedAt = context.now?.() ?? Date.now();
  await emit(policy, { type: "execution.started", capabilityId: capability.id, timestamp: isoNow() });

  if (manifest.confirmation === "required") {
    await emit(policy, { type: "confirmation.requested", capabilityId: capability.id, timestamp: isoNow() });
    if (!policy?.confirm) {
      await emit(policy, {
        type: "confirmation.denied",
        capabilityId: capability.id,
        timestamp: isoNow(),
        metadata: { reason: "no_confirmation_handler" },
      });
      throw new CapabilityDeniedError(`Capability ${capability.id} requires explicit human confirmation`);
    }

    const approved = await policy.confirm({ capability: manifest, input });
    await emit(policy, {
      type: approved ? "confirmation.approved" : "confirmation.denied",
      capabilityId: capability.id,
      timestamp: isoNow(),
    });
    if (!approved) throw new CapabilityDeniedError(`Capability ${capability.id} was denied by the user`);
  }

  try {
    const result = await capability.execute(input, context);
    await emit(policy, {
      type: "execution.succeeded",
      capabilityId: capability.id,
      timestamp: isoNow(),
      durationMs: (context.now?.() ?? Date.now()) - startedAt,
    });
    return result;
  } catch (error) {
    await emit(policy, {
      type: "execution.failed",
      capabilityId: capability.id,
      timestamp: isoNow(),
      durationMs: (context.now?.() ?? Date.now()) - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
