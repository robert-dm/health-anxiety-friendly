import { escapeHtml } from "./html.js";

export function layout({ title, body, user = null }) {
  const adminLink = user && ["admin", "moderator"].includes(user.role) ? `<a href="/admin">Admin</a>` : "";
  const accountLinks = user
    ? `<a href="/cuenta">Mi actividad</a>
        ${adminLink}
        <form class="inline-form" method="post" action="/salir"><button type="submit">Salir</button></form>`
    : `<a href="/ingresar">Ingresar</a>
        <a class="button compact" href="/registro">Crear cuenta</a>`;

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} - Health Anxiety Friendly</title>
    <meta name="description" content="Directorio comunitario de profesionales y centros de salud con comunicacion clara, respetuosa y sin alarmismo innecesario.">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="stylesheet" href="/styles/main.css">
    <script src="/scripts/main.js" defer></script>
  </head>
  <body>
    <a class="skip-link" href="#contenido">Saltar al contenido</a>
    <header class="site-header">
      <nav class="nav" aria-label="Principal">
        <a class="brand" href="/" aria-label="Health Anxiety Friendly, inicio"><span class="brand-mark" aria-hidden="true">h<span>af</span></span><span>Health Anxiety<br><strong>Friendly</strong></span></a>
        <div class="nav-links">
          <a href="/buscar">Buscar</a>
          <a href="/buscar?tipo=profesionales">Profesionales</a>
          <a href="/buscar?tipo=centros">Centros de salud y estudios</a>
          <a href="/guias">Guías</a>
          <a href="/agregar">Agregar</a>
          ${accountLinks}
        </div>
      </nav>
    </header>
    <main id="contenido">${body}</main>
    <footer class="footer">
      Health Anxiety Friendly separa informacion objetiva de experiencias de pacientes. Las valoraciones comunitarias no son rankings de calidad medica.
    </footer>
  </body>
</html>`;
}
