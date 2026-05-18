const WEBHOOK_STAGGER_MS = 5_000;

export interface N8nWebhookTarget {
  url: string;
  secret: string | null;
}

export interface N8nWebhookInvokeResult {
  url: string;
  ok: boolean;
  status: number | null;
  responseBody: string;
  error: string | null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postWebhook(
  target: N8nWebhookTarget,
  payload: Record<string, unknown>,
): Promise<N8nWebhookInvokeResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (target.secret) {
    headers.Authorization = target.secret;
  }

  try {
    const response = await fetch(target.url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const responseBody = await response.text().catch(() => "");

    if (!response.ok) {
      return {
        url: target.url,
        ok: false,
        status: response.status,
        responseBody: responseBody.slice(0, 2_000),
        error: `HTTP ${response.status}`,
      };
    }

    return {
      url: target.url,
      ok: true,
      status: response.status,
      responseBody: responseBody.slice(0, 2_000),
      error: null,
    };
  } catch (error) {
    return {
      url: target.url,
      ok: false,
      status: null,
      responseBody: "",
      error: error instanceof Error ? error.message : "unknown error",
    };
  }
}

export async function invokeN8nWebhooks(
  targets: N8nWebhookTarget[],
  payload: Record<string, unknown>,
  options?: { stagger?: boolean },
): Promise<N8nWebhookInvokeResult[]> {
  const results: N8nWebhookInvokeResult[] = [];
  const stagger = options?.stagger ?? targets.length > 1;

  for (let i = 0; i < targets.length; i++) {
    if (stagger && i > 0) {
      await sleep(WEBHOOK_STAGGER_MS);
    }
    results.push(await postWebhook(targets[i]!, payload));
  }

  return results;
}
