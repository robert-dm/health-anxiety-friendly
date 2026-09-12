import { targetCard } from "../components/cards.js";

export function homePage({ featured }) {
  return `<section class="hero">
    <div>
      <h1>Health Anxiety Friendly</h1>
      <p>Encontra profesionales y centros de salud valorados por personas que entienden lo importante que es una atencion clara, respetuosa y sin alarmismo innecesario.</p>
    </div>
    <aside class="hero-panel">
      <form class="search-form" action="/buscar" method="get">
        <div class="field">
          <label for="q">Que estas buscando?</label>
          <input id="q" name="q" type="search" placeholder="Psicologo TOC, cardiologo, ecografia, laboratorio...">
        </div>
        <div class="field">
          <label for="where">Donde?</label>
          <input id="where" name="where" type="search" placeholder="Haedo, Moron, CABA...">
        </div>
        <button class="button" type="submit">Buscar</button>
      </form>
    </aside>
  </section>

  <section class="section">
    <div class="quick-grid">
      <a class="card" href="/buscar?q=Psicologia"><h3>Psicologos y psiquiatras</h3><p>Atencion orientada a ansiedad, TOC y manejo de incertidumbre.</p></a>
      <a class="card" href="/buscar?q=Cardiologia"><h3>Medicos</h3><p>Especialidades clinicas con foco en comunicacion clara.</p></a>
      <a class="card" href="/buscar?q=Ecografia"><h3>Centros de estudios</h3><p>Experiencias sobre trato, organizacion y preferencias de comunicacion.</p></a>
    </div>
  </section>

  <section class="section">
    <div class="disclaimer">
      Una buena atencion no es solamente un diagnostico correcto. Para una persona con ansiedad por la salud, la forma de comunicar, preguntar y manejar la incertidumbre tambien importa.
    </div>
  </section>

  <section class="section">
    <div class="section-header">
      <h2>Bien valorados por la comunidad</h2>
      <a href="/buscar">Ver todos</a>
    </div>
    <div class="result-list">
      ${featured.map(targetCard).join("")}
    </div>
  </section>`;
}
