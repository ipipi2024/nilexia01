import client from "./mongodb";

/**
 * Sets up MongoDB TTL index for automatic session cleanup
 * Sessions will be automatically deleted when expiresAt passes
 *
 * IMPORTANT: Creating an index is a relatively expensive operation.
 * The index creation adds overhead on every document in the collection,
 * as MongoDB needs to scan and index the expiresAt field for all sessions.
 *
 * However, this is a ONE-TIME operation per deployment. MongoDB intelligently
 * checks if the index already exists and won't recreate it on subsequent calls.
 * The long-term benefit of automatic cleanup outweighs the initial setup cost.
 */
export async function setupSessionCleanup() {
    try {
        const db = client.db();

        // Create TTL index on the session collection
        // expireAfterSeconds: 0 means delete immediately when expiresAt is reached
        // NOTE: This is an expensive operation as it creates an index on the expiresAt field
        // for every session document in the database. MongoDB will scan all existing sessions
        // to build this index, but it only happens once (or when the index doesn't exist).
        // Connection to MongoDB happens lazily when this first operation runs
        await db.collection('session').createIndex(
            { expiresAt: 1 },
            {
                expireAfterSeconds: 0,
                name: 'session_ttl_index'
            }
        );

        if (process.env.NODE_ENV === "development") {
            console.log('✓ Session TTL index created successfully');
        }
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error('Failed to create session TTL index:', error);
        }
        // Don't throw - allow app to continue even if index creation fails
    }
}


// Declare a global slot for dev/HMR so we don't re-run on every reload
declare global {
    // undefined = not started yet
    // Promise<void> = already started / running / completed
    // null is allowed too, but we won't use it here
    // eslint-disable-next-line no-var
    var _sessionCleanupPromise: Promise<void> | undefined;
  }
  
  // For production (no HMR), we can keep a simple module-level variable
  let sessionCleanupPromise: Promise<void> | undefined;
  
  /**
   * Ensure that session cleanup is initialized at most once per process.
   * Safe to call multiple times; only the first call actually triggers the work.
   */
  export function ensureSessionCleanupRunsOnce() {
    if (process.env.NODE_ENV === "development") {
      // In dev, use globalThis to survive HMR reloads
      if (!global._sessionCleanupPromise) {
        global._sessionCleanupPromise = setupSessionCleanup();
      }
      return global._sessionCleanupPromise;
    } else {
      // In production, modules are loaded once per process, but just to be safe:
      if (!sessionCleanupPromise) {
        sessionCleanupPromise = setupSessionCleanup();
      }
      return sessionCleanupPromise;
    }
  }
  