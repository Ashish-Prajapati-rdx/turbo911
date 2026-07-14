import { MongoClient } from "mongodb";
import dotenv from "dotenv";

if (!process.env.MONGODB_URI) {
  // Try loading server/.env if the variable isn't already set
  dotenv.config({ path: "server/.env" });
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set in environment or server/.env");
}
const mongoUri: string = uri;

let cached: { client: MongoClient } | undefined;

export async function connectToMongo() {
  if (cached) return cached.client;

  const client = new MongoClient(mongoUri);
  await client.connect();
  cached = { client };
  return client;
}

export async function getDb(dbName?: string) {
  const client = await connectToMongo();
  return client.db(dbName);
}
