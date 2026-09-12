import { escapeHtml } from "./html.js";

export function layout({ title, body }) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} - Health Anxiety Friendly</title>
    <meta name="description" content="Directorio comunitario de profesionales y centros de salud con comunicacion clara, respetuosa y sin alarmismo innecesario.">
    <link rel="stylesheet" href="/styles/main.css">
    <script src="/scripts/main.js" defer></script>
  </head>
  <body>
    <header class="site-header">
      <nav class="nav" aria-label="Principal">
        <a class="brand" href="/">Health Anxiety Friendly</a>
        <div class="nav-links">
          <a href="/buscar">Buscar</a>
          <a href="/buscar?tipo=profesionales">Profesionales</a>
          <a href="/buscar?tipo=centros">Centros de estudios</a>
          <a href="/guias">Guias</a>
          <a href="/agregar">Agregar</a>
        </div>
      </nav>
    </header>
    <main>${body}</main>
    <footer class="footer">
      Health Anxiety Friendly separa informacion objetiva de experiencias de pacientes. Las valoraciones comunitarias no son rankings de calidad medica.
    </footer>
  </body>
</html>`;
}
