import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "./connection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "migrations");

export function migrate() {
  const db = getDb();
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();

  db.exec(`
    create table if not exists migrations (
      id text primary key,
      applied_at text not null
    );
  `);

  const applied = new Set(db.prepare("select id from migrations").all().map((row) => row.id));

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    db.exec("begin");
    try {
      db.exec(sql);
      db.prepare("insert into migrations (id, applied_at) values (?, ?)").run(file, new Date().toISOString());
      db.exec("commit");
      console.log(`Applied ${file}`);
    } catch (error) {
      db.exec("rollback");
      throw error;
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate();
}
