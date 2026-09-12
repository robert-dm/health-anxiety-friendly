import path from "node:path";

export const config = {
  host: process.env.HOST || "127.0.0.1",
  port: Number(process.env.PORT || 3000),
  databasePath: process.env.DATABASE_PATH || path.join("data", "app.db"),
  sessionCookieName: process.env.SESSION_COOKIE_NAME || "haf_session",
};
