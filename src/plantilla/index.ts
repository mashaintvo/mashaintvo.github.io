import { renderNav } from './cabecera';
import { renderPortada } from './portada';
import { renderCarta } from './carta';
import { renderTrabajo } from './trabajo';
import { renderMetodo } from './metodo';
import { renderIndice } from './indice';
import { renderColofon } from './colofon';
import { renderContacto } from './contacto';
import { renderPie } from './pie';
import { idioma, type Lang } from './util';

export { renderHead } from './head';

export function renderBody(lang: Lang) {
  const L = idioma(lang);
  return `
  <a class="saltar" href="#contenido">${L('Skip to content', 'Saltar al contenido')}</a>

  <canvas class="webgl" aria-hidden="true"></canvas>
  <div class="fx-vineta" aria-hidden="true"></div>

  <div class="cargador" aria-hidden="true">
    <p class="cargador__nombre"><b>maría</b> <span class="grad">sanjuán</span></p>
    <p class="cargador__linea" data-rol="${L('frontend ai developer & ux/ui designer', 'desarrolladora front-end con ia y diseñadora ux/ui')}"><span data-cargador-texto></span><span class="cargador__caret"></span></p>
  </div>

  ${renderNav(lang)}

  <main id="contenido">
    ${renderPortada(lang)}
    ${renderCarta(lang)}
    ${renderTrabajo(lang)}
    ${renderMetodo(lang)}
    ${renderIndice(lang)}
    ${renderColofon(lang)}
    ${renderContacto(lang)}
  </main>

  ${renderPie(lang)}`;
}
