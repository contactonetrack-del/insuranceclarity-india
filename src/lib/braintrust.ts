/**
 * Braintrust logging helper.
 * Sends AI telemetry and error events to Braintrust when configured.
 */

type BraintrustMetadata = Record<string, unknown>;

export interface BraintrustEvent {
  eventType: string;
  timestamp?: string;
  projectId?: string;
  input?: string;
  output?: string;
  error?: string;
  metadata?: BraintrustMetadata;
}

const BRAINTRUST_API_KEY = process.env.BRAINTRUST_API_KEY?.trim();
const BRAINTRUST_PROJECT_ID = process.env.BRAINTRUST_PROJECT_ID?.trim();
const BRAINTRUST_API_URL = process.env.BRAINTRUST_API_URL?.trim() ?? 'https://api.braintrust.dev/v1/events';

function buildHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${BRAINTRUST_API_KEY}`,
  } as const;
}

function isConfigured(): boolean {
  return Boolean(BRAINTRUST_API_KEY && BRAINTRUST_PROJECT_ID);
}

export async function logBraintrustEvent(event: BraintrustEvent): Promise<void> {
  if (!isConfigured()) {
    return;
  }

  const payload = {
    projectId: BRAINTRUST_PROJECT_ID,
    eventType: event.eventType,
    timestamp: event.timestamp ?? new Date().toISOString(),
    input: event.input,
    output: event.output,
    error: event.error,
    metadata: event.metadata,
  };

  try {
    await fetch(BRAINTRUST_API_URL, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
  } catch {
    // Do not fail the request if Braintrust event logging fails.
  }
}
