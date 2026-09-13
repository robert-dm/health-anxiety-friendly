import { escapeHtml } from "../html.js";

const professionalQuestions = [
  ["listening", "Sentiste que te escucharon?"],
  ["respect", "Fue respetuoso?"],
  ["clear_communication", "La comunicacion fue clara?"],
  ["non_alarmist", "Evito alarmismo innecesario?"],
  ["avoids_reassurance_seeking", "Evito alimentar busquedas de reaseguramiento?"],
  ["respects_limits", "Respeto tus preferencias o limites?"],
  ["rational_tests", "Evito estudios o intervenciones innecesarios segun tu experiencia?"],
  ["uncertainty_support", "Ayudo a manejar la incertidumbre?"],
  ["understands_health_anxiety", "Comprendio tu ansiedad por la salud/TOC?"],
];

const facilityQuestions = [
  ["staff_respect", "El personal fue respetuoso?"],
  ["communication_preferences", "Respetaron tus preferencias de comunicacion?"],
  ["no_unrequested_findings", "Evitaron comentar hallazgos sin que lo pidieras?"],
  ["avoids_speculation", "Evitaron especulaciones durante el estudio?"],
  ["low_anxiety_procedure", "Pudiste realizar el estudio sin conversaciones que aumentaran innecesariamente tu ansiedad?"],
  ["organization", "La organizacion fue adecuada?"],
  ["overall_experience", "La experiencia general del centro fue adecuada?"],
];

function errorsBlock(errors = []) {
  if (!errors.length) return "";
  return `<div class="notice error">${errors.map((error) => `<p>${escapeHtml(error)}</p>`).join("")}</div>`;
}

function ratingSelect(name, value = "", id = name) {
  return `<select id="${id}" name="${name}" required>
    <option value="">Elegir</option>
    ${[1, 2, 3, 4, 5].map((score) => `<option value="${score}" ${String(value) === String(score) ? "selected" : ""}>${score}</option>`).join("")}
  </select>`;
}

function scoreFields(questions, values) {
  return questions
    .map(
      ([key, label]) => `<div class="score-row">
        <label for="${key}">${escapeHtml(label)}</label>
        ${ratingSelect(key, values[key], key)}
      </div>`,
    )
    .join("");
}

function facilityExtra(values) {
  return `<div class="field">
    <label for="commented_findings_frequency">Durante el estudio comentaron o interpretaron imagenes/hallazgos antes del informe?</label>
    <select id="commented_findings_frequency" name="commented_findings_frequency">
      ${[
        ["", "Elegir"],
        ["never", "Nunca"],
        ["almost_never", "Casi nunca"],
        ["sometimes", "Algunas veces"],
        ["frequently", "Frecuentemente"],
        ["always", "Siempre"],
      ]
        .map(([value, label]) => `<option value="${value}" ${values.commented_findings_frequency === value ? "selected" : ""}>${label}</option>`)
        .join("")}
    </select>
  </div>
  <div class="form-grid">
    <div class="field">
      <label for="preference_requested">Pediste que no comentaran resultados durante el estudio?</label>
      <select id="preference_requested" name="preference_requested">
        <option value="">No aplica / no recuerdo</option>
        <option value="yes" ${values.preference_requested === "yes" ? "selected" : ""}>Si</option>
        <option value="no" ${values.preference_requested === "no" ? "selected" : ""}>No</option>
      </select>
    </div>
    <div class="field">
      <label for="preference_respected">Si lo pediste, respetaron esa preferencia?</label>
      <select id="preference_respected" name="preference_respected">
        <option value="">No aplica / no recuerdo</option>
        <option value="yes" ${values.preference_respected === "yes" ? "selected" : ""}>Si</option>
        <option value="no" ${values.preference_respected === "no" ? "selected" : ""}>No</option>
      </select>
    </div>
  </div>`;
}

export function reviewPage({ target, errors = [], values = {}, saved = false }) {
  const questions = target.type === "professional" ? professionalQuestions : facilityQuestions;
  const pathType = target.type === "professional" ? "profesional" : "centro";

  return `<section class="section narrow">
    <h1>Compartir experiencia</h1>
    <p class="muted">${escapeHtml(target.name)} · ${escapeHtml(target.subtitle || "")}</p>
    ${saved ? `<div class="notice success"><p>Gracias por compartir tu experiencia. Queda en revision antes de publicarse.</p></div>` : ""}
    ${errorsBlock(errors)}
    <form class="card stacked-form" method="post" action="/review/${pathType}/${target.id}">
      <div class="field">
        <label for="overall_rating">Como fue tu experiencia general?</label>
        ${ratingSelect("overall_rating", values.overall_rating)}
      </div>
      <div class="form-grid">
        <div class="field">
          <label for="visit_type">Tipo de consulta o estudio</label>
          <input id="visit_type" name="visit_type" value="${escapeHtml(values.visit_type)}" placeholder="Consulta inicial, ecografia...">
        </div>
        <div class="field">
          <label for="approx_visit_month">Mes aproximado</label>
          <input id="approx_visit_month" name="approx_visit_month" type="month" value="${escapeHtml(values.approx_visit_month)}">
        </div>
      </div>
      <fieldset class="segmented scores">
        <legend>Valoraciones especificas</legend>
        ${scoreFields(questions, values)}
      </fieldset>
      ${target.type === "facility" ? facilityExtra(values) : ""}
      <div class="field">
        <label for="comment">Comentario libre</label>
        <textarea id="comment" name="comment" rows="6" maxlength="1600" placeholder="Que ocurrio? Que te resulto positivo o dificil? Como manejaron tu ansiedad por la salud?">${escapeHtml(values.comment)}</textarea>
      </div>
      <div class="disclaimer">Evita publicar diagnosticos, resultados de estudios, nombres de otros pacientes o informacion personal sensible.</div>
      <label class="checkbox">
        <input name="anonymous" type="checkbox" value="yes" ${values.anonymous === "no" ? "" : "checked"}>
        <span>Publicar como paciente anonimo</span>
      </label>
      <button class="button" type="submit">Publicar experiencia</button>
    </form>
  </section>`;
}
