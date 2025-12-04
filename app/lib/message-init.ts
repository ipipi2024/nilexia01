import { ensureMessageIndexes } from "./models/message";

// Flag to prevent multiple initializations
let hasRun = false;

/**
 * Ensure message indexes are created only once
 * Similar pattern to listing-init.ts
 */
export function ensureMessageIndexesRunOnce(): void {
  if (hasRun) {
    return;
  }

  hasRun = true;

  // Run index creation in the background (non-blocking)
  ensureMessageIndexes().catch((error) => {
    console.error("Failed to create message indexes:", error);
  });
}
