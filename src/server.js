import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { migrate } from "./db/migrate.js";
import { getFeatured, searchTargets } from "./domain/search.js";
import { getFacilityBySlug, getProfessionalBySlug } from "./domain/profiles.js";
import { authenticateUser, registerUser } from "./domain/users.js";
import { createProfileSuggestion, getUserSuggestions } from "./domain/suggestions.js";
import { createReview, getReviewTarget, getUserReviews } from "./domain/reviews.js";
import { canUseAdmin, getAdminDashboard, updateReportStatus, updateReviewStatus, updateSuggestionStatus } from "./domain/admin.js";
import { clearSessionCookie, createSession, destroySession, getCurrentUser, sessionCookie } from "./auth/sessions.js";
import { layout } from "./views/layout.js";
import { homePage } from "./views/pages/home.js";
import { searchPage } from "./views/pages/search.js";
import { facilityPage, professionalPage } from "./views/pages/profile.js";
import { loginPage, registerPage } from "./views/pages/auth.js";
import { accountPage } from "./views/pages/account.js";
import { addPage } from "./views/pages/add.js";
import { reviewPage } from "./views/pages/review.js";
import { adminPage } from "./views/pages/admin.js";
import { guidesPage, howItWorksPage } from "./views/pages/static.js";

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

function sendHtml(response, title, body, status = 200, user = null) {
  response.writeHead(status, { "content-type": "text/html; charset=utf-8" });
  response.end(layout({ title, body, user }));
}

function sendNotFound(response, user = null) {
  sendHtml(
    response,
    "No encontrado",
    `<section class="section"><h1>No encontramos esta pagina</h1><p class="muted">Revisa la direccion o volve a buscar.</p><a class="button" href="/buscar">Buscar</a></section>`,
    404,
    user,
  );
}

function redirect(response, location, headers = {}) {
  response.writeHead(303, { location, ...headers });
  response.end();
}

function parseReviewPath(pathname) {
  const match = pathname.match(/^\/review\/(profesional|centro)\/([^/]+)$/);
  if (!match) return null;
  return {
    targetType: match[1] === "profesional" ? "professional" : "facility",
    targetId: decodeURIComponent(match[2]),
  };
}

function sendForbidden(response, user = null) {
  sendHtml(
    response,
    "Sin permisos",
    `<section class="section"><h1>Sin permisos</h1><p class="muted">Esta seccion requiere permisos de moderacion.</p></section>`,
    403,
    user,
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

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        request.destroy();
        reject(new Error("Body too large"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function formData(request) {
  const body = await readBody(request);
  return Object.fromEntries(new URLSearchParams(body));
}

async function route(request, response) {
  if (serveStatic(request, response)) return;

  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname;
  const user = getCurrentUser(request);

  if (request.method === "POST") {
    if (pathname === "/registro") {
      const data = await formData(request);
      const result = registerUser({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        acceptedGuidelines: data.acceptedGuidelines === "yes",
      });

      if (!result.ok) {
        sendHtml(response, "Crear cuenta", registerPage({ errors: result.errors, values: data }), 422, user);
        return;
      }

      const session = createSession(result.userId);
      redirect(response, "/cuenta", { "set-cookie": sessionCookie(session.token, session.expiresAt) });
      return;
    }

    if (pathname === "/ingresar") {
      const data = await formData(request);
      const result = authenticateUser({ email: data.email, password: data.password });

      if (!result.ok) {
        sendHtml(response, "Ingresar", loginPage({ errors: result.errors, email: data.email }), 422, user);
        return;
      }

      const session = createSession(result.userId);
      redirect(response, "/cuenta", { "set-cookie": sessionCookie(session.token, session.expiresAt) });
      return;
    }

    if (pathname === "/salir") {
      destroySession(request);
      redirect(response, "/", { "set-cookie": clearSessionCookie() });
      return;
    }

    if (pathname === "/agregar") {
      if (!user) return redirect(response, "/ingresar");
      const data = await formData(request);
      const result = createProfileSuggestion({ userId: user.id, targetType: data.targetType, form: data });
      if (!result.ok) {
        sendHtml(response, "Agregar", addPage({ errors: result.errors, values: data }), 422, user);
        return;
      }
      redirect(response, "/agregar?guardado=1");
      return;
    }

    if (pathname === "/admin/reviews/status") {
      if (!canUseAdmin(user)) return sendForbidden(response, user);
      const data = await formData(request);
      const result = updateReviewStatus({ reviewId: data.id, status: data.status, moderatorId: user.id });
      if (!result.ok) {
        sendHtml(response, "Administracion", adminPage({ dashboard: getAdminDashboard(), errors: result.errors }), 422, user);
        return;
      }
      redirect(response, "/admin");
      return;
    }

    if (pathname === "/admin/suggestions/status") {
      if (!canUseAdmin(user)) return sendForbidden(response, user);
      const data = await formData(request);
      const result = updateSuggestionStatus({ suggestionId: data.id, status: data.status, moderatorId: user.id });
      if (!result.ok) {
        sendHtml(response, "Administracion", adminPage({ dashboard: getAdminDashboard(), errors: result.errors }), 422, user);
        return;
      }
      redirect(response, "/admin");
      return;
    }

    if (pathname === "/admin/reports/status") {
      if (!canUseAdmin(user)) return sendForbidden(response, user);
      const data = await formData(request);
      const result = updateReportStatus({ reportId: data.id, status: data.status, moderatorId: user.id });
      if (!result.ok) {
        sendHtml(response, "Administracion", adminPage({ dashboard: getAdminDashboard(), errors: result.errors }), 422, user);
        return;
      }
      redirect(response, "/admin");
      return;
    }

    const reviewPath = parseReviewPath(pathname);
    if (reviewPath) {
      if (!user) return redirect(response, "/ingresar");
      const data = await formData(request);
      const target = getReviewTarget(reviewPath.targetType, reviewPath.targetId);
      if (!target) return sendNotFound(response, user);

      const result = createReview({ userId: user.id, targetType: reviewPath.targetType, targetId: reviewPath.targetId, form: data });
      if (!result.ok) {
        sendHtml(response, "Compartir experiencia", reviewPage({ target, errors: result.errors, values: data }), 422, user);
        return;
      }

      redirect(response, `${pathname}?guardado=1`);
      return;
    }

    response.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
    response.end("Metodo no permitido");
    return;
  }

  if (request.method !== "GET") {
    response.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
    response.end("Metodo no permitido");
    return;
  }

  if (pathname === "/") {
    sendHtml(response, "Inicio", homePage({ featured: getFeatured() }), 200, user);
    return;
  }

  if (pathname === "/buscar") {
    const q = url.searchParams.get("q") || "";
    const where = url.searchParams.get("where") || "";
    sendHtml(response, "Buscar", searchPage({ q, where, results: searchTargets({ q, where }) }), 200, user);
    return;
  }

  if (pathname.startsWith("/profesionales/")) {
    const slug = decodeURIComponent(pathname.replace("/profesionales/", ""));
    const professional = getProfessionalBySlug(slug);
    if (!professional) return sendNotFound(response, user);
    sendHtml(response, professional.display_name, professionalPage({ professional }), 200, user);
    return;
  }

  if (pathname.startsWith("/centros/")) {
    const slug = decodeURIComponent(pathname.replace("/centros/", ""));
    const facility = getFacilityBySlug(slug);
    if (!facility) return sendNotFound(response, user);
    sendHtml(response, facility.name, facilityPage({ facility }), 200, user);
    return;
  }

  if (pathname === "/guias") {
    sendHtml(response, "Guias", guidesPage(), 200, user);
    return;
  }

  if (pathname === "/como-funciona") {
    sendHtml(response, "Como funciona", howItWorksPage(), 200, user);
    return;
  }

  if (pathname === "/ingresar") {
    if (user) return redirect(response, "/cuenta");
    sendHtml(response, "Ingresar", loginPage(), 200, user);
    return;
  }

  if (pathname === "/registro") {
    if (user) return redirect(response, "/cuenta");
    sendHtml(response, "Crear cuenta", registerPage(), 200, user);
    return;
  }

  if (pathname === "/cuenta") {
    if (!user) return redirect(response, "/ingresar");
    sendHtml(response, "Mi actividad", accountPage({ user, suggestions: getUserSuggestions(user.id), reviews: getUserReviews(user.id) }), 200, user);
    return;
  }

  if (pathname === "/agregar") {
    if (!user) return redirect(response, "/ingresar");
    sendHtml(response, "Agregar", addPage({ saved: url.searchParams.get("guardado") === "1" }), 200, user);
    return;
  }

  if (pathname === "/admin") {
    if (!user) return redirect(response, "/ingresar");
    if (!canUseAdmin(user)) return sendForbidden(response, user);
    sendHtml(response, "Administracion", adminPage({ dashboard: getAdminDashboard() }), 200, user);
    return;
  }

  const reviewPath = parseReviewPath(pathname);
  if (reviewPath) {
    if (!user) return redirect(response, "/ingresar");
    const target = getReviewTarget(reviewPath.targetType, reviewPath.targetId);
    if (!target) return sendNotFound(response, user);
    sendHtml(response, "Compartir experiencia", reviewPage({ target, saved: url.searchParams.get("guardado") === "1" }), 200, user);
    return;
  }

  sendNotFound(response, user);
}

migrate();

const server = http.createServer(async (request, response) => {
  try {
    await route(request, response);
  } catch (error) {
    console.error(error);
    sendHtml(response, "Error", `<section class="section"><h1>Ocurrio un error</h1><p class="muted">Intenta nuevamente en unos minutos.</p></section>`, 500);
  }
});

server.listen(config.port, config.host, () => {
  console.log(`Server running at http://${config.host}:${config.port}`);
});
