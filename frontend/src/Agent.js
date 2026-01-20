import { tools } from "./tools";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runAgent({ onEvent } = {}) {
  const apiBase = import.meta.env.VITE_API_URL || "";
  const callId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `call_${Date.now()}`;
  const deferredCall = {
    id: callId,
    name: "pickFile",
    arguments: { accept: ".pdf" },
  };

  if (onEvent) {
    onEvent("request_sending", deferredCall);
  }
  await fetch(`${apiBase}/request_tool/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(deferredCall),
  });
  if (onEvent) {
    onEvent("request_sent", deferredCall);
  }

  const result = await tools[deferredCall.name]({
    ...deferredCall.arguments,
    onEvent,
  });

  const error = result && result.error ? result.error : null;
  if (onEvent) {
    onEvent("result_sending", { callId, result, error });
  }
  await fetch(`${apiBase}/tool_result/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      call_id: callId,
      result,
      error: error || undefined,
    }),
  });
  if (onEvent) {
    onEvent("result_sent", { callId, result, error });
  }

  const backendResult = await pollBackendResult({
    apiBase,
    callId,
    onEvent,
  });

  return { callId, result, backendResult };
}

async function pollBackendResult({ apiBase, callId, onEvent }) {
  if (onEvent) {
    onEvent("agent_poll_start", { callId });
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(`${apiBase}/tool_result/${callId}`);
    const data = await response.json();
    if (data && data.status !== "pending") {
      if (onEvent) {
        onEvent("agent_poll_done", data);
      }
      return data;
    }
    await sleep(300);
  }
  if (onEvent) {
    onEvent("agent_poll_timeout", { callId });
  }
  return { status: "pending" };
}
