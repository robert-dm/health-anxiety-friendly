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
    <h1>Cómo interpretar las etiquetas</h1>
    <p>La información publicada por un profesional o centro y las experiencias de pacientes tienen fuentes distintas.</p>
    <div class="card">
      <h2>Evidencia pública</h2>
      <p><strong>Declara atención de ansiedad por la salud:</strong> la fuente menciona expresamente esa atención o hipocondría.</p>
      <p><strong>Declara experiencia o formación en TOC:</strong> la fuente identifica formación, práctica o pertenencia a un equipo especializado. El alcance se explica en la ficha.</p>
      <p><strong>Atención adaptada al miedo dental / opción para claustrofobia:</strong> la fuente describe una adaptación para esa situación concreta. No acredita experiencia en TOC de salud ni se extiende a otros servicios.</p>
      <p><strong>Declara comunicación clara:</strong> compromiso general de comunicación publicado por el prestador; no demuestra una adaptación específica a la ansiedad.</p>
      <p><strong>Pendiente de revisión:</strong> aún no contamos con evidencia específica revisada. No es una valoración negativa de la atención.</p>
      <p>Cada evidencia incluye su fuente, alcance y fecha de consulta. Los datos pueden cambiar; confirmá disponibilidad y adaptaciones con el prestador.</p>
      <h2>Datos básicos y experiencias</h2>
      <p>Los <strong>datos básicos comprobados</strong> corresponden a identidad, especialidad o ubicación. No certifican el trato ni equivalen a una recomendación.</p>
      <p>Las <strong>experiencias publicadas</strong> son opiniones de usuarios del sitio. No importamos estrellas externas ni asignamos una etiqueta de «recomendado por pacientes» sin evidencia comunitaria suficiente.</p>
    </div>
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
