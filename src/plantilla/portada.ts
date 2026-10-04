import { modo } from './cabecera';
import { idioma, type Lang } from './util';

export function renderPortada(lang: Lang) {
  const L = idioma(lang);
  const cv = lang === 'es' ? '/cv/maria-sanjuan-hoja-de-vida.pdf' : '/cv/maria-sanjuan-resume.pdf';
  return `
  <section class="portada" id="inicio" aria-labelledby="portada-t" data-seccion="${L('Cover', 'Portada')}">
    <p class="portada__edicion" data-entra><span>${L('Portfolio', 'Portafolio')}</span><span>${L('2026 edition', 'Edición 2026')}</span></p>

    <figure class="portada__fig" data-retrato>
      <img class="portada__poster" src="/retrato/retrato.webp" width="1145" height="1400" alt="${L('Portrait of María Sanjuán, smiling, with her hand on her chin.', 'Retrato de María Sanjuán, sonriente, con la mano en el mentón.')}" fetchpriority="high" />
      <div class="portada__scan" aria-hidden="true"></div>
    </figure>

    <div class="portada__texto">
      <h1 class="portada__titulo" id="portada-t">
        <span class="portada__nombre"><span class="linea"><span>maría</span></span><span class="linea"><span><em>sanjuán</em></span></span></span>
        <span class="portada__rol" data-entra>${L('Frontend AI Developer', 'Desarrolladora front-end con IA')} <span class="amp">&amp;</span> ${L('UX/UI Designer', 'diseñadora UX/UI')}</span>
      </h1>
      <p class="portada__lead" data-entra>${L(
        'I design in Figma and ship to production in React and Angular. Today I build with AI agents: the spec leads, automated checks hold the line, and I make the calls.',
        'Diseño en Figma y llevo a producción en React y Angular. Hoy construyo con agentes de IA: la especificación manda, las verificaciones automáticas sostienen la calidad y las decisiones las tomo yo.',
      )}</p>
      <div class="portada__acciones" data-entra>
        ${modo(L, 'portada')}
        <a class="btn" href="#contacto"><span>${L('Let’s talk', 'Hablemos')}</span><i aria-hidden="true">→</i></a>
        <a class="enlace" href="${cv}" download>${L('Résumé', 'Hoja de vida')} <small>PDF</small></a>
      </div>
    </div>

    <p class="portada__vertical" aria-hidden="true">${L('Two roles · one signature', 'Dos roles · una firma')}</p>
    <div class="portada__meta" data-entra>
      <span>Bogotá, Colombia · ${L('remote', 'en remoto')}</span>
      <p class="portada__pie"><span class="fig">Fig. 0</span> ${L('Portrait in code. Each row of glyphs is a line of a program; the depth was computed with AI from a photo. Move the cursor: the designer is underneath.', 'Retrato en código. Cada fila de glifos es una línea de un programa; la profundidad se calculó con IA a partir de una foto. Mueve el cursor: debajo está la diseñadora.')}</p>
      <span class="portada__scroll" aria-hidden="true"><i></i>${L('Scroll', 'Desliza')}</span>
    </div>
  </section>

  <div class="lupa" aria-hidden="true" data-lupa><span data-lupa-label data-c="${L('design', 'diseño')}" data-d="${L('code', 'código')}">${L('design', 'diseño')}</span></div>`;
}
