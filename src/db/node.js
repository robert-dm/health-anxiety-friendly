import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { config } from "../config.js";

let database;

export function getNodeDb() {
  if (!database) {
    const directory = path.dirname(config.databasePath);
    fs.mkdirSync(directory, { recursive: true });
    database = new DatabaseSync(config.databasePath);
    database.exec("PRAGMA foreign_keys = ON;");
  }

  return database;
}
