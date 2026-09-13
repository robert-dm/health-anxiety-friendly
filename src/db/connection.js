import { AsyncLocalStorage } from "node:async_hooks";
const databases = new AsyncLocalStorage();
let defaultDatabase;
export function setDefaultDatabase(db) { defaultDatabase = db; }
export function withDatabase(db, callback) { return databases.run(db, callback); }
export function getDb() {
  const db = databases.getStore() || defaultDatabase;
  if (!db) throw new Error("Database not initialized");
  return db;
}
