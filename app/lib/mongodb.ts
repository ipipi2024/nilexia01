import { MongoClient } from "mongodb"; //import mongodb client

if (!process.env.MONGODB_URI) {
  throw new Error('Missing MONGODB_URI');
}

const uri = process.env.MONGODB_URI;

let client: MongoClient;

declare global {
  var _mongoClient: MongoClient | undefined;
}

if (process.env.NODE_ENV === "development") {
  // Only create once during HMR
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri);
  }
  client = global._mongoClient;
} else {
  // Fresh client per production instance
  client = new MongoClient(uri);
}

// Export only the client (tool), not a connection
export default client;
