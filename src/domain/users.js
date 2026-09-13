import crypto from "node:crypto";
import { getDb } from "../db/connection.js";
import { hashPassword, verifyPassword } from "../auth/passwords.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function registerUser({ email, password, displayName, acceptedGuidelines }) {
  const normalizedEmail = normalizeEmail(email);
  const errors = [];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) errors.push("Ingresa un email valido.");
  if (String(password || "").length < 8) errors.push("La contrasena debe tener al menos 8 caracteres.");
  if (normalizedEmail.length > 254) errors.push("El email es demasiado largo.");
  if (String(password || "").length > 256) errors.push("La contraseña no puede superar 256 caracteres.");
  if (String(displayName || "").trim().length > 80) errors.push("El nombre visible no puede superar 80 caracteres.");
  if (!acceptedGuidelines) errors.push("Tenes que aceptar las normas de la comunidad.");

  if (errors.length) return { ok: false, errors };

  const now = new Date().toISOString();
  const anonymousName = `Paciente anonimo ${crypto.randomInt(1000, 9999)}`;

  try {
    const userId = crypto.randomUUID();
    (await getDb()
      .prepare(
        `
        insert into users (
          id, email, password_hash, display_name, anonymous_name,
          community_guidelines_accepted_at, created_at, updated_at
        ) values (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .run(
        userId,
        normalizedEmail,
        await hashPassword(password),
        String(displayName || "").trim() || null,
        anonymousName,
        now,
        now,
        now,
      ));

    return { ok: true, userId };
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) return { ok: false, errors: ["Ya existe una cuenta con ese email."] };
    throw error;
  }
}

export async function authenticateUser({ email, password }) {
  if (String(password || "").length > 256) return { ok: false, errors: ["Email o contraseña incorrectos."] };
  const user = (await getDb()
    .prepare("select id, password_hash, status from users where email = ?")
    .get(normalizeEmail(email)));

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return { ok: false, errors: ["Email o contrasena incorrectos."] };
  }

  if (user.status === "suspended" || user.status === "banned") {
    return { ok: false, errors: ["Esta cuenta no puede iniciar sesion."] };
  }

  return { ok: true, userId: user.id };
}
