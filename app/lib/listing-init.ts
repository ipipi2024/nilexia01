import { ensureListingIndexes } from "./models/listing";

// Flag to prevent multiple initializations
let hasRun = false;

/**
 * Ensure listing indexes are created only once
 * Similar pattern to session-cleanup.ts
 */
export function ensureListingIndexesRunOnce(): void {
  if (hasRun) {
    return;
  }

  hasRun = true;

  // Run index creation in the background (non-blocking)
  ensureListingIndexes().catch((error) => {
    console.error("Failed to create listing indexes:", error);
  });
}
