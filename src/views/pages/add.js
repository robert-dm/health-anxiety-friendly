import { escapeHtml } from "../html.js";

function errorsBlock(errors = []) {
  if (!errors.length) return "";
  return `<div class="notice error">${errors.map((error) => `<p>${escapeHtml(error)}</p>`).join("")}</div>`;
}

export function addPage({ errors = [], values = {}, saved = false } = {}) {
  const targetType = values.targetType || "professional";

  return `<section class="section">
    <h1>Agregar profesional o centro</h1>
    <p class="muted">La propuesta queda como informacion de la comunidad hasta que pueda revisarse o verificarse.</p>
    ${saved ? `<div class="notice success"><p>Recibimos tu propuesta. Va a aparecer en tu actividad como en revision.</p></div>` : ""}
    ${errorsBlock(errors)}
  </section>

  <section class="section narrow">
    <form class="card stacked-form" method="post" action="/agregar">
      <fieldset class="segmented">
        <legend>Que queres agregar?</legend>
        <label><input type="radio" name="targetType" value="professional" ${targetType === "professional" ? "checked" : ""}> Profesional</label>
        <label><input type="radio" name="targetType" value="facility" ${targetType === "facility" ? "checked" : ""}> Centro de salud / diagnostico</label>
      </fieldset>
      <div class="field">
        <label for="name">Nombre</label>
        <input id="name" name="name" value="${escapeHtml(values.name)}" required>
      </div>
      <div class="field">
        <label for="specialty">Especialidad o tipo de estudio</label>
        <input id="specialty" name="specialty" value="${escapeHtml(values.specialty)}" placeholder="Psicologia, cardiologia, ecografia...">
      </div>
      <div class="field">
        <label for="institution">Institucion</label>
        <input id="institution" name="institution" value="${escapeHtml(values.institution)}">
      </div>
      <div class="form-grid">
        <div class="field">
          <label for="city">Ciudad</label>
          <input id="city" name="city" value="${escapeHtml(values.city)}" placeholder="CABA, Haedo, Moron...">
        </div>
        <div class="field">
          <label for="neighborhood">Barrio / zona</label>
          <input id="neighborhood" name="neighborhood" value="${escapeHtml(values.neighborhood)}">
        </div>
      </div>
      <div class="field">
        <label for="address_public">Direccion publica</label>
        <input id="address_public" name="address_public" value="${escapeHtml(values.address_public)}">
      </div>
      <div class="form-grid">
        <div class="field">
          <label for="website_url">Sitio web</label>
          <input id="website_url" name="website_url" value="${escapeHtml(values.website_url)}" inputmode="url">
        </div>
        <div class="field">
          <label for="public_phone">Telefono publico</label>
          <input id="public_phone" name="public_phone" value="${escapeHtml(values.public_phone)}">
        </div>
      </div>
      <div class="field">
        <label for="relationship">Como lo conoces?</label>
        <select id="relationship" name="relationship">
          ${["Fui paciente", "Lo conozco profesionalmente", "Lo encontre buscando atencion", "Otra"]
            .map((option) => `<option ${values.relationship === option ? "selected" : ""}>${option}</option>`)
            .join("")}
        </select>
      </div>
      <div class="field">
        <label for="reason">Por que pensas que puede ser util para esta comunidad?</label>
        <textarea id="reason" name="reason" rows="5" required>${escapeHtml(values.reason)}</textarea>
      </div>
      <button class="button" type="submit">Enviar propuesta</button>
    </form>
  </section>`;
}
