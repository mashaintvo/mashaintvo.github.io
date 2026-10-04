import { anot, idioma, type Lang } from './util';

/**
 * El colofón: cómo se hizo este portafolio, como en la última página de una
 * revista. Las cifras que dependen del navegador (glifos) las escribe main.ts
 * cuando la escena existe; sin ella, queda la frase general.
 */
export function renderColofon(lang: Lang) {
  const L = idioma(lang);
  return `
  <section class="colofon" id="colofon" aria-labelledby="colofon-t" data-seccion="${L('Colophon', 'Colofón')}">
    <div class="colofon__grid">
      <header class="colofon__cab">
        ${anot('<section id="colofon">', 'Manrope 300 · 0,94 · −5 %')}
        <h2 class="colofon__titulo" id="colofon-t" data-lineas>${L('Colophon', 'Colofón')}</h2>
        <p class="colofon__lead" data-revela>${L('How this portfolio was made. It counts as a case too.', 'Cómo se hizo este portafolio. También cuenta como caso.')}</p>
      </header>

      <figure class="colofon__retrato" data-revela>
        <div class="colofon__canales">
          <img src="/retrato/canal-luz.webp" width="300" height="367" alt="${L('Luminance channel of the portrait, in grayscale.', 'Canal de luminancia del retrato, en escala de grises.')}" loading="lazy" />
          <img src="/retrato/canal-profundidad.webp" width="300" height="367" alt="${L('Depth map of the portrait: the face and hand are lighter because they are closer.', 'Mapa de profundidad del retrato: la cara y la mano se ven más claras porque están más cerca.')}" loading="lazy" />
          <img src="/retrato/canal-mascara.webp" width="300" height="367" alt="${L('The cut-out mask: the silhouette in white over black.', 'La máscara del recorte: la silueta en blanco sobre negro.')}" loading="lazy" />
        </div>
        <figcaption class="colofon__pie">${L('Light, depth and mask: the three maps the portrait is made from.', 'Luz, profundidad y máscara: los tres mapas con los que está hecho el retrato.')}</figcaption>
      </figure>

      <dl class="colofon__lista">
        <div data-revela><dt>${L('Concept', 'Concepto')}</dt><dd>${L(
          'Two roles, one signature. Everything exists in two materials, code and design, and the switch at the top decides which one leads: the portrait, the notes in the margins and the accent color.',
          'Dos roles, una firma. Todo existe en dos materiales, código y diseño, y el interruptor de arriba decide cuál va delante: el retrato, las notas de los márgenes y el color de acento.',
        )}</dd></div>
        <div data-revela><dt>${L('Portrait', 'Retrato')}</dt><dd>${L(
          'An AI-generated photo of me. MODNet cut me out and Depth Anything V2 gave me depth, both running on my own computer: the photo never left it. Then a program is written over the photo, row by row, one character per glyph:',
          'Una foto mía generada con IA. MODNet me recortó y Depth Anything V2 me dio profundidad, los dos funcionando en mi propio computador: la foto nunca salió de él. Después, un programa se escribe sobre la foto, fila a fila, un carácter por glifo:',
        )} <span data-glifos>${L('thousands of glyphs', 'miles de glifos')}</span>.</dd></div>
        <div data-revela><dt>${L('Type', 'Tipografía')}</dt><dd>${L(
          'Manrope for the headlines and my name; Geist for the text and Geist Mono for the code. All under the SIL Open Font License and served from this site: no requests to third parties.',
          'Manrope en los titulares y en mi nombre; Geist en el texto y Geist Mono en el código. Todas con licencia SIL Open Font y servidas desde este sitio: ninguna petición a terceros.',
        )}</dd></div>
        <div data-revela><dt>${L('Code', 'Código')}</dt><dd>${L(
          'Vite, TypeScript, three.js, GSAP and Lenis, without a framework. The particle engine is adapted from the one I built for luminahub.com.co. Every text lives in the HTML, in English and Spanish, written once side by side.',
          'Vite, TypeScript, three.js, GSAP y Lenis, sin framework. El motor de partículas está adaptado del que hice para luminahub.com.co. Todo el texto vive en el HTML, en inglés y en español, escritos una sola vez, uno al lado del otro.',
        )}</dd></div>
        <div data-revela><dt>${L('Access', 'Acceso')}</dt><dd>${L(
          'It reads complete without JavaScript and without WebGL, it works with a keyboard, and with reduced motion there is no smooth scroll, no loader and the portrait stays still. Body text on the background passes 17:1.',
          'Se lee entero sin JavaScript y sin WebGL, funciona con teclado, y con movimiento reducido no hay scroll suave ni pantalla de carga y el retrato se queda quieto. El texto sobre el fondo pasa de 17:1.',
        )}</dd></div>
        <div data-revela><dt>${L('Credits', 'Créditos')}</dt><dd>${L(
          'Design and code: María Sanjuán, with AI agents (Claude). Review: María Sanjuán.',
          'Diseño y código: María Sanjuán, con agentes de IA (Claude). Revisión: María Sanjuán.',
        )}</dd></div>
      </dl>
    </div>
  </section>`;
}
