import mongoose from "mongoose";

const globalForMongoose = globalThis;
const cached = globalForMongoose.__mongooseCache || {
  conn: null,
  promise: null,
};

if (!globalForMongoose.__mongooseCache) {
  globalForMongoose.__mongooseCache = cached;
}

export const connectDatabase = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
