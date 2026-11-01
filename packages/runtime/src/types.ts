export type JsonSchema = Record<string, unknown>;

export type CapabilityEffect = "read" | "write" | "consequential" | "payment";
export type OutputTrust = "trusted" | "untrusted" | "mixed";
export type ConfirmationMode = "none" | "required";

export interface CapabilityContext {
  signal?: AbortSignal;
  origin?: string;
  now?: () => number;
}

export interface CapabilityDefinition<Input extends Record<string, unknown> = Record<string, unknown>, Output = unknown> {
  /** Stable, adapter-independent identifier. Example: cart.add */
  id: string;
  /** Semver for the semantic contract, not the implementation build. */
  version: string;
  /** Adapter-facing tool name. Example: add_to_cart */
  name: string;
  title?: string;
  description: string;
  inputSchema: JsonSchema;
  effect: CapabilityEffect;
  outputTrust?: OutputTrust;
  confirmation?: ConfirmationMode;
  tags?: string[];
  execute: (input: Input, context: CapabilityContext) => Promise<Output> | Output;
}

export interface CapabilityManifestEntry {
  id: string;
  version: string;
  name: string;
  title?: string;
  description: string;
  inputSchema: JsonSchema;
  effect: CapabilityEffect;
  outputTrust: OutputTrust;
  confirmation: ConfirmationMode;
  tags: string[];
}

export type AuditEventType =
  | "registration.succeeded"
  | "registration.skipped"
  | "execution.started"
  | "confirmation.requested"
  | "confirmation.approved"
  | "confirmation.denied"
  | "execution.succeeded"
  | "execution.failed";

export interface AuditEvent {
  type: AuditEventType;
  capabilityId: string;
  timestamp: string;
  durationMs?: number;
  adapter?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export type AuditSink = (event: AuditEvent) => void | Promise<void>;

export interface ConfirmationRequest {
  capability: CapabilityManifestEntry;
  input: Record<string, unknown>;
}

export type ConfirmationHandler = (request: ConfirmationRequest) => boolean | Promise<boolean>;

export interface RuntimePolicy {
  /** Consequential and payment capabilities are denied without a positive confirmation. */
  confirm?: ConfirmationHandler;
  audit?: AuditSink;
  /** Optional kill switch evaluated before every invocation. */
  enabled?: () => boolean;
}
