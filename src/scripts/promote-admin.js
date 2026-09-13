import { fileURLToPath } from "node:url";
import { getDb } from "../db/connection.js";
import { migrate } from "../db/migrate.js";

export function promoteAdmin(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Uso: npm run user:admin -- email@example.com");
  }

  migrate();
  const result = getDb().prepare("update users set role = 'admin', updated_at = ? where email = ?").run(new Date().toISOString(), normalizedEmail);
  if (!result.changes) throw new Error(`No existe un usuario con email ${normalizedEmail}`);
  return normalizedEmail;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const email = promoteAdmin(process.argv[2]);
    console.log(`Usuario promovido a admin: ${email}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
