import type {
  CapabilityDefinition,
  CapabilityManifestEntry,
  ConfirmationMode,
  OutputTrust,
} from "./types.js";

const ID_RE = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
const NAME_RE = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

function defaultConfirmation(effect: CapabilityDefinition["effect"]): ConfirmationMode {
  return effect === "consequential" || effect === "payment" ? "required" : "none";
}

export function validateCapability(capability: CapabilityDefinition): void {
  if (!ID_RE.test(capability.id)) throw new Error(`Invalid capability id: ${capability.id}`);
  if (!NAME_RE.test(capability.name)) throw new Error(`Invalid capability name: ${capability.name}`);
  if (!SEMVER_RE.test(capability.version)) throw new Error(`Invalid capability version: ${capability.version}`);
  if (!capability.description.trim()) throw new Error(`Capability ${capability.id} must have a description`);
  if (!capability.inputSchema || typeof capability.inputSchema !== "object") {
    throw new Error(`Capability ${capability.id} must have an inputSchema object`);
  }
  const confirmation = capability.confirmation ?? defaultConfirmation(capability.effect);
  if ((capability.effect === "consequential" || capability.effect === "payment") && confirmation !== "required") {
    throw new Error(`${capability.effect} capability ${capability.id} must require confirmation`);
  }
}

export function defineCapability<Input extends Record<string, unknown>, Output>(
  capability: CapabilityDefinition<Input, Output>,
): CapabilityDefinition<Input, Output> {
  validateCapability(capability as CapabilityDefinition);
  return Object.freeze({ ...capability });
}

export function toManifestEntry(capability: CapabilityDefinition): CapabilityManifestEntry {
  validateCapability(capability);
  const outputTrust: OutputTrust = capability.outputTrust ?? "trusted";
  return {
    id: capability.id,
    version: capability.version,
    name: capability.name,
    title: capability.title,
    description: capability.description,
    inputSchema: capability.inputSchema,
    effect: capability.effect,
    outputTrust,
    confirmation: capability.confirmation ?? defaultConfirmation(capability.effect),
    tags: capability.tags ?? [],
  };
}

export function buildManifest(capabilities: readonly CapabilityDefinition[]): CapabilityManifestEntry[] {
  const ids = new Set<string>();
  const names = new Set<string>();
  return capabilities.map((capability) => {
    if (ids.has(capability.id)) throw new Error(`Duplicate capability id: ${capability.id}`);
    if (names.has(capability.name)) throw new Error(`Duplicate capability name: ${capability.name}`);
    ids.add(capability.id);
    names.add(capability.name);
    return toManifestEntry(capability);
  });
}
