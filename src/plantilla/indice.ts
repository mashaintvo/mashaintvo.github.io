import { FORMACION, GRUPOS, IDIOMAS, TRABAJOS } from '../datos/trayectoria';
import { anot, esc, idioma, type Lang } from './util';

/**
 * Conocimientos × trayectoria: un índice de revista. Cada conocimiento que la
 * hoja de vida asocia a un trabajo es un botón: al pulsarlo (o pasar por
 * encima) se encienden los trabajos donde se usó. Los demás son texto.
 */
export function renderIndice(lang: Lang) {
  const L = idioma(lang);
  const usados = new Set(TRABAJOS.flatMap((t) => t.usa));
  return `
  <section class="indice" id="indice" aria-labelledby="indice-t" data-seccion="${L('Skills', 'Conocimientos')}">
    <div class="indice__grid">
      <header class="indice__cab">
        ${anot('<section id="indice">', 'Manrope 300 · 0,94 · −5 %')}
        <h2 class="indice__titulo" id="indice-t" data-lineas>${L('What I know,', 'Lo que sé,')}<br><em>${L('and where I used it.', 'y dónde lo usé.')}</em></h2>
        <p class="indice__lead" data-revela>${L(
          'Eight years, in two columns. Pick a skill to light up the jobs where I used it, or a job to see its skills.',
          'Ocho años, en dos columnas. Elige un conocimiento y se encienden los trabajos donde lo usé, o elige un trabajo para ver sus conocimientos.',
        )}</p>
      </header>

      <div class="indice__saber" data-indice-saber>
        ${GRUPOS.map((g) => `
        <div class="indice__grupo indice__grupo--${g.id}">
          <h3 class="indice__grupo-t">${g.nombre[lang]}</h3>
          <ul class="indice__items" data-anim="cascada">${g.items.map((i) => usados.has(i.id)
            ? `<li><button type="button" class="indice__k" data-k="${i.id}" aria-pressed="false">${esc(i.nombre[lang])}</button></li>`
            : `<li><span class="indice__k indice__k--solo" data-k="${i.id}">${esc(i.nombre[lang])}</span></li>`).join('')}</ul>
        </div>`).join('')}
      </div>

      <div class="indice__trayectoria">
        <h3 class="indice__col-t">${L('Experience', 'Trayectoria')}</h3>
        <ol class="indice__trabajos" data-anim="cascada">
          ${TRABAJOS.map((t) => `
          <li class="trabajo-item" data-trabajo="${t.id}" data-usa="${t.usa.join(' ')}">
            <button type="button" class="trabajo-item__btn" aria-pressed="false" aria-describedby="t-${t.id}-logro">
              <span class="trabajo-item__fechas">${t.fechas[lang]}</span>
              <span class="trabajo-item__empresa">${esc(t.empresa)}</span>
              <span class="trabajo-item__rol">${esc(t.rol[lang])}${t.lugar ? ` · ${t.lugar[lang]}` : ''}</span>
            </button>
            ${t.logro ? `<p class="trabajo-item__logro" id="t-${t.id}-logro">${esc(t.logro[lang])}</p>` : `<span hidden id="t-${t.id}-logro"></span>`}
          </li>`).join('')}
        </ol>
        <h3 class="indice__col-t">${L('Education', 'Formación')}</h3>
        <ul class="indice__formacion" data-anim="cascada">
          ${FORMACION.map((f) => `<li><span class="trabajo-item__fechas">${f.fechas}</span><span class="trabajo-item__empresa">${esc(f.titulo[lang])}</span><span class="trabajo-item__rol">${esc(f.donde)}</span></li>`).join('')}
        </ul>
        <p class="indice__idiomas"><span>${L('Languages', 'Idiomas')}</span> ${IDIOMAS[lang]}</p>
      </div>
      <p class="sr-only" aria-live="polite" data-indice-anuncio></p>
    </div>
  </section>`;
}
