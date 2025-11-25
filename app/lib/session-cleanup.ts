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

        console.log('✓ Session TTL index created successfully');
    } catch (error) {
        console.error('Failed to create session TTL index:', error);
        // Don't throw - allow app to continue even if index creation fails
    }
}
