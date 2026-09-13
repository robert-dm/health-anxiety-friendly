import { escapeHtml } from "../html.js";

function errorsBlock(errors = []) {
  if (!errors.length) return "";
  return `<div class="notice error">${errors.map((error) => `<p>${escapeHtml(error)}</p>`).join("")}</div>`;
}

export function loginPage({ errors = [], email = "" } = {}) {
  return `<section class="section narrow">
    <h1>Ingresar</h1>
    ${errorsBlock(errors)}
    <form class="card stacked-form" method="post" action="/ingresar">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" value="${escapeHtml(email)}" autocomplete="email" required>
      </div>
      <div class="field">
        <label for="password">Contrasena</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required>
      </div>
      <button class="button" type="submit">Ingresar</button>
    </form>
  </section>`;
}

export function registerPage({ errors = [], values = {} } = {}) {
  return `<section class="section narrow">
    <h1>Crear cuenta</h1>
    ${errorsBlock(errors)}
    <form class="card stacked-form" method="post" action="/registro">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" value="${escapeHtml(values.email)}" autocomplete="email" required>
      </div>
      <div class="field">
        <label for="password">Contrasena</label>
        <input id="password" name="password" type="password" autocomplete="new-password" minlength="8" required>
      </div>
      <div class="field">
        <label for="displayName">Nombre visible opcional</label>
        <input id="displayName" name="displayName" value="${escapeHtml(values.displayName)}" autocomplete="nickname">
      </div>
      <label class="checkbox">
        <input name="acceptedGuidelines" type="checkbox" value="yes" ${values.acceptedGuidelines ? "checked" : ""} required>
        <span>Acepto las normas de la comunidad</span>
      </label>
      <p class="muted">No solicitamos DNI, fecha de nacimiento, diagnostico, historia clinica ni domicilio personal.</p>
      <button class="button" type="submit">Crear cuenta</button>
    </form>
  </section>`;
}
