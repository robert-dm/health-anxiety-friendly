import { targetCard } from "../components/cards.js";

export function homePage({ featured }) {
  return `<section class="directory-intro">
    <p class="eyebrow">DIRECTORIO COMUNITARIO · CABA Y GRAN BUENOS AIRES</p>
    <h1>La forma de atenderte<br><em>también importa.</em></h1>
    <p class="intro-copy">Encontrá profesionales y centros con una comunicación clara y respetuosa de la ansiedad por la salud y el TOC.</p>
    <form class="directory-search" action="/buscar" method="get" role="search">
      <div class="field"><label for="q">¿Qué atención necesitás?</label><input id="q" name="q" type="search" placeholder="Especialidad, profesional o estudio"></div>
      <div class="field"><label for="where">¿En qué zona?</label><input id="where" name="where" type="search" placeholder="Haedo, Morón, CABA…"></div>
      <button class="button" type="submit">Buscar atención <span aria-hidden="true">↗</span></button>
    </form>
    <nav class="category-links" aria-label="Tipos de atención">
      <a href="/buscar?categoria=mental_health">Psicología y psiquiatría</a>
      <a href="/buscar?categoria=medical">Especialidades médicas</a>
      <a href="/buscar?tipo=centros">Centros de estudios</a>
    </nav>
  </section>
  <section class="directory-body">
    <div>
      <div class="section-header"><div><p class="eyebrow">EXPLORÁ EL DIRECTORIO</p><h2>Profesionales y centros</h2></div><a class="text-link" href="/buscar">Ver todos ↗</a></div>
      <div class="result-list">${featured.length ? featured.map(targetCard).join("") : `<article class="card empty-state"><h3>El directorio empieza con la comunidad</h3><p>Estamos reuniendo las primeras propuestas. ¿Conocés un profesional o centro que pueda aportar?</p><a class="button secondary" href="/agregar">Proponer un perfil</a></article>`}</div>
    </div>
    <aside class="directory-aside">
      <div class="principles-panel"><span class="eyebrow">UNA ATENCIÓN QUE TE ESCUCHE</span><h2>Elegir también es<br>poder preguntar.</h2><ul><li>Comunicación clara y sin alarmismo</li><li>Respeto por tus preferencias</li><li>Acompañamiento de la incertidumbre</li></ul><a href="/como-funciona">Cómo funciona el directorio ↗</a></div>
      <div class="aside-note"><h3>Tu experiencia puede ayudar</h3><p>Compartí cómo fue el trato. Podés publicar de forma anónima con una cuenta registrada.</p><a class="text-link" href="/agregar">Agregar profesional o centro ↗</a></div>
      <p class="small muted">Las valoraciones describen experiencias de atención. No son una evaluación de la calidad médica.</p>
    </aside>
  </section>`;
}
