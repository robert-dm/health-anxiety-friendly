import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { migrate } from "./db/migrate.js";
import { getFeatured, searchTargets } from "./domain/search.js";
import { getFacilityBySlug, getProfessionalBySlug } from "./domain/profiles.js";
import { layout } from "./views/layout.js";
import { homePage } from "./views/pages/home.js";
import { searchPage } from "./views/pages/search.js";
import { facilityPage, professionalPage } from "./views/pages/profile.js";
import { guidesPage, howItWorksPage, placeholderPage } from "./views/pages/static.js";
import { escapeHtml } from "./views/html.js";

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

function sendHtml(response, title, body, status = 200) {
  response.writeHead(status, { "content-type": "text/html; charset=utf-8" });
  response.end(layout({ title, body }));
}

function sendNotFound(response) {
  sendHtml(
    response,
    "No encontrado",
    `<section class="section"><h1>No encontramos esta pagina</h1><p class="muted">Revisa la direccion o volve a buscar.</p><a class="button" href="/buscar">Buscar</a></section>`,
    404,
  );
}

function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const normalizedPath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, normalizedPath);

  if (!filePath.startsWith(publicDir)) {
    sendNotFound(response);
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

function route(request, response) {
  if (request.method !== "GET") {
    response.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
    response.end("Metodo no permitido");
    return;
  }

  if (serveStatic(request, response)) return;

  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname;

  if (pathname === "/") {
    sendHtml(response, "Inicio", homePage({ featured: getFeatured() }));
    return;
  }

  if (pathname === "/buscar") {
    const q = url.searchParams.get("q") || "";
    const where = url.searchParams.get("where") || "";
    sendHtml(response, "Buscar", searchPage({ q, where, results: searchTargets({ q, where }) }));
    return;
  }

  if (pathname.startsWith("/profesionales/")) {
    const slug = decodeURIComponent(pathname.replace("/profesionales/", ""));
    const professional = getProfessionalBySlug(slug);
    if (!professional) return sendNotFound(response);
    sendHtml(response, professional.display_name, professionalPage({ professional }));
    return;
  }

  if (pathname.startsWith("/centros/")) {
    const slug = decodeURIComponent(pathname.replace("/centros/", ""));
    const facility = getFacilityBySlug(slug);
    if (!facility) return sendNotFound(response);
    sendHtml(response, facility.name, facilityPage({ facility }));
    return;
  }

  if (pathname === "/guias") {
    sendHtml(response, "Guias", guidesPage());
    return;
  }

  if (pathname === "/como-funciona") {
    sendHtml(response, "Como funciona", howItWorksPage());
    return;
  }

  if (["/agregar", "/ingresar", "/registro", "/cuenta"].includes(pathname) || pathname.startsWith("/review/")) {
    const label = pathname.split("/").filter(Boolean).join(" / ") || "Seccion";
    sendHtml(response, escapeHtml(label), placeholderPage({ title: escapeHtml(label) }));
    return;
  }

  sendNotFound(response);
}

migrate();

const server = http.createServer((request, response) => {
  try {
    route(request, response);
  } catch (error) {
    console.error(error);
    sendHtml(response, "Error", `<section class="section"><h1>Ocurrio un error</h1><p class="muted">Intenta nuevamente en unos minutos.</p></section>`, 500);
  }
});

server.listen(config.port, config.host, () => {
  console.log(`Server running at http://${config.host}:${config.port}`);
});
