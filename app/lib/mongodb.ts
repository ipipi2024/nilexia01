
//test if it evaluates
console.log(">>> mongodb.ts evaluated");


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
    console.log(">>> DEV: creating global._mongoClientPromise");
    global._mongoClient = new MongoClient(uri);
  }else{
    console.log(">>> DEV: reusing global._mongoClientPromise");
  }
  client = global._mongoClient;
} else {
  // Fresh client per production instance
  console.log(">>> PROD: creating new MongoClient");
  client = new MongoClient(uri);
}

// Export only the client (tool), not a connection
export default client;
