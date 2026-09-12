export function guidesPage() {
  return `<section class="section">
    <h1>Guias</h1>
    <div class="result-grid">
      <article class="card"><h3>Como elegir un medico si tenes ansiedad por la salud</h3><p>Enfocarse en comunicacion, limites y manejo de incertidumbre.</p></article>
      <article class="card"><h3>Como elegir un centro de diagnostico</h3><p>Que mirar antes de reservar un estudio y como expresar preferencias.</p></article>
      <article class="card"><h3>Informacion medica y reaseguramiento</h3><p>Diferenciar una explicacion util de una busqueda compulsiva de tranquilidad.</p></article>
    </div>
  </section>`;
}

export function howItWorksPage() {
  return `<section class="section">
    <h1>Como funciona</h1>
    <div class="result-grid">
      <article class="card"><h3>Informacion profesional</h3><p>Datos objetivos como especialidad, ubicacion, modalidad y estado de verificacion.</p></article>
      <article class="card"><h3>Experiencias</h3><p>Comentarios y valoraciones de pacientes, separados de la informacion verificada.</p></article>
      <article class="card"><h3>Compatibilidad</h3><p>Indicadores comunitarios sobre comunicacion, respeto, limites y manejo de ansiedad.</p></article>
    </div>
  </section>`;
}

export function placeholderPage({ title }) {
  return `<section class="section">
    <h1>${title}</h1>
    <div class="card"><p>Esta seccion esta preparada para la siguiente fase del MVP.</p></div>
  </section>`;
}
