import { importExpandedDirectory } from './db/import-expanded-directory.js';
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { migrate } from "./db/migrate.js";
import { getNodeDb } from "./db/node.js";
import { setDefaultDatabase } from "./db/connection.js";
import { route } from "./app.js";
export { route } from "./app.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const normalizedPath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, normalizedPath);

  if (!filePath.startsWith(publicDir + path.sep)) {
    response.writeHead(404); response.end("Not found");
    return true;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return false;
  }

  const extension = path.extname(filePath);
  response.writeHead(200, { "content-type": contentTypes[extension] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(response);
  return true;
}


if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate();
  setDefaultDatabase(getNodeDb());
  await importExpandedDirectory();
  const server = http.createServer(async (request, response) => {
    try {
      if (!serveStatic(request, response)) await route(request, response);
    } catch (error) {
      console.error(error);
      if (!response.headersSent) response.writeHead(500, {"content-type":"text/plain; charset=utf-8"});
      response.end("No pudimos completar la solicitud. Intentá nuevamente.");
    }
  });
  server.listen(config.port, config.host, () => console.log(`Server running at http://${config.host}:${config.port}`));
}
