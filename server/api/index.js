import app from "../src/app.js";
import { connectDatabase } from "../src/config/db.js";

let databaseConnectionPromise;

const ensureDatabaseConnection = async () => {
  if (!databaseConnectionPromise) {
    databaseConnectionPromise = connectDatabase().catch((error) => {
      databaseConnectionPromise = null;
      throw error;
    });
  }

  await databaseConnectionPromise;
};

const normalizeRequestUrl = (req) => {
  const url = new URL(req.url || "/", "http://localhost");
  const routedPath = req.query?.path;

  if (typeof routedPath === "string" && routedPath.length > 0) {
    url.pathname = `/api/${routedPath}`;
    url.searchParams.delete("path");
    req.url = `${url.pathname}${url.search}`;
    return;
  }

  if (Array.isArray(routedPath) && routedPath.length > 0) {
    url.pathname = `/api/${routedPath.join("/")}`;
    url.searchParams.delete("path");
    req.url = `${url.pathname}${url.search}`;
    return;
  }

  req.url = "/api";
};

export default async function handler(req, res) {
  await ensureDatabaseConnection();
  normalizeRequestUrl(req);
  return app(req, res);
}
