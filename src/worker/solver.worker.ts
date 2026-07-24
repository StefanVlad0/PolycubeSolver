/// <reference lib="webworker" />
import type { WorkerRequest, WorkerResponse } from "../types";
import { solvePuzzle, InvalidPuzzleError } from "../lib/solver";

let cancelled = false;

function post(msg: WorkerResponse) {
  (self as unknown as Worker).postMessage(msg);
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const data = e.data;
  if (data.type === "cancel") {
    cancelled = true;
    return;
  }
  if (data.type !== "solve") return;

  cancelled = false;
  let lastPost = 0;

  try {
    const { meta, solutions } = solvePuzzle(
      data.pieces,
      data.container,
      data.settings,
      {
        shouldContinue: () => !cancelled,
        onProgress: (count, distinctCount, nodes) => {
          const now = performance.now();
          if (now - lastPost > 120) {
            lastPost = now;
            post({ type: "progress", count, distinctCount, nodes });
          }
        },
      },
    );
    post({ type: "done", meta, solutions });
  } catch (err) {
    if (err instanceof InvalidPuzzleError) {
      post({ type: "error", kind: "invalid", message: err.message });
    } else {
      post({
        type: "error",
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
};
