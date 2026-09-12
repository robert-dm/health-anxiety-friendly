import { escapeHtml } from "../html.js";
import { targetCard } from "../components/cards.js";

export function searchPage({ q, where, results }) {
  const title = q || where ? `Resultados para ${[q, where].filter(Boolean).map(escapeHtml).join(" cerca de ")}` : "Buscar profesionales y centros";

  return `<section class="section">
    <h1>${title}</h1>
    <form class="hero-panel search-form" action="/buscar" method="get">
      <div class="field">
        <label for="q">Que estas buscando?</label>
        <input id="q" name="q" type="search" value="${escapeHtml(q)}" placeholder="Psicologo TOC, cardiologo, ecografia...">
      </div>
      <div class="field">
        <label for="where">Donde?</label>
        <input id="where" name="where" type="search" value="${escapeHtml(where)}" placeholder="Haedo, Moron, CABA...">
      </div>
      <button class="button" type="submit">Buscar</button>
    </form>
  </section>

  <section class="section">
    <div class="section-header">
      <h2>${results.length} resultado${results.length === 1 ? "" : "s"}</h2>
      <p>No mostramos fragmentos negativos de experiencias en resultados.</p>
    </div>
    <div class="result-list">
      ${results.length ? results.map(targetCard).join("") : `<div class="card"><h3>No encontramos resultados</h3><p>Proba con otra especialidad, estudio o zona.</p></div>`}
    </div>
  </section>`;
}
