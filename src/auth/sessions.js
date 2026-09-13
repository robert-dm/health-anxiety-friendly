import crypto from "node:crypto";
import { config } from "../config.js";
import { getDb } from "../db/connection.js";

const sessionDurationMs = 1000 * 60 * 60 * 24 * 30;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function parseCookies(cookieHeader = "") {
  const cookies = {};
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName) continue;
    cookies[rawName] = decodeURIComponent(rawValue.join("="));
  }
  return cookies;
}

export function createSession(userId) {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionDurationMs).toISOString();

  db.prepare("insert into sessions (id, user_id, token_hash, expires_at, created_at) values (?, ?, ?, ?, ?)").run(
    crypto.randomUUID(),
    userId,
    hashToken(token),
    expiresAt,
    now.toISOString(),
  );

  return { token, expiresAt };
}

export function getCurrentUser(request) {
  const token = parseCookies(request.headers.cookie || "")[config.sessionCookieName];
  if (!token) return null;

  const db = getDb();
  const user = db
    .prepare(
      `
      select u.id, u.email, u.display_name, u.anonymous_name, u.role, u.status
      from sessions s
      join users u on u.id = s.user_id
      where s.token_hash = ? and s.expires_at > ?
    `,
    )
    .get(hashToken(token), new Date().toISOString());

  if (!user || user.status === "banned" || user.status === "suspended") return null;
  return user;
}

export function destroySession(request) {
  const token = parseCookies(request.headers.cookie || "")[config.sessionCookieName];
  if (!token) return;
  getDb().prepare("delete from sessions where token_hash = ?").run(hashToken(token));
}

export function sessionCookie(token, expiresAt) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${config.sessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}${secure}`;
}

export function clearSessionCookie() {
  return `${config.sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
