import { anot, idioma, type Lang } from './util';

/**
 * La carta: quién es María, en primera persona y firmada. Las cifras van como
 * notas al pie, con su fuente (hoja de vida y repositorios), en lugar de
 * contadores: aquí se lee, no se cuenta.
 */
export function renderCarta(lang: Lang) {
  const L = idioma(lang);
  const nota = (n: number) => `<sup class="ref"><a href="#nota-${n}" id="ref-${n}" aria-describedby="notas-t">${n}</a></sup>`;
  return `
  <section class="carta" id="sobre-mi" aria-labelledby="carta-t" data-seccion="${L('About', 'Sobre mí')}">
    <div class="carta__grid">
      <header class="carta__cab">
        ${anot('<section id="sobre-mi">', 'Manrope 300 · 0,94 · −5 %')}
        <h2 class="carta__titulo" id="carta-t" data-lineas>${L('Two roles,', 'Dos roles,')}<br><em>${L('one signature.', 'una firma.')}</em></h2>
      </header>

      <div class="carta__cuerpo">
        <p class="carta__p carta__p--capitular" data-revela>${L(
          `For eight years${nota(1)} I’ve designed and built interfaces for teams in Spain, Germany and Colombia: travel, higher education, legal publishing, health. I’ve led UX teams and design systems, and I write the front-end myself, in React, Angular or Vue.`,
          `Llevo ocho años${nota(1)} diseñando y construyendo interfaces para equipos de España, Alemania y Colombia: viajes, educación superior, edición jurídica, salud. He liderado equipos de UX y sistemas de diseño, y el front-end lo escribo yo, en React, Angular o Vue.`,
        )}</p>
        <p class="carta__p" data-revela>${L(
          `Today I work with AI agents the way a director works with a crew. I write the spec, the agents build, automated checks hold the line, and every decision gets a person’s review: mine. At Interkont it’s how the whole team works${nota(2)}. At Lúmina Tech, the company I founded${nota(3)}, it’s how I built a school platform that has been in production since August${nota(4)}.`,
          `Hoy trabajo con agentes de IA como una directora con su equipo. Yo escribo la especificación, los agentes construyen, las verificaciones automáticas sostienen la calidad y cada decisión pasa por la revisión de una persona: yo. En Interkont es la forma de trabajar de todo el equipo${nota(2)}. En Lúmina Tech, la empresa que fundé${nota(3)}, así construí una plataforma escolar que está en producción desde agosto${nota(4)}.`,
        )}</p>
        <p class="carta__p" data-revela>${L(
          'This portfolio is built the same way, and you can touch everything in it. The demos are real code, recreated with fictitious data.',
          'Este portafolio está hecho igual, y todo se puede tocar. Las demos son código de verdad, recreadas con datos ficticios.',
        )}</p>
        <p class="carta__firma" data-revela><span class="carta__firma-nombre">maría</span><span class="carta__firma-lugar">Bogotá, ${L('October 2026', 'octubre de 2026')}</span></p>
      </div>

      <aside class="carta__notas" aria-labelledby="notas-t">
        <h3 class="sr-only" id="notas-t">${L('Notes', 'Notas')}</h3>
        <ol data-anim="cascada">
          <li id="nota-1"><span class="carta__n" aria-hidden="true">1</span><p>${L('Since April 2018, starting at Viajemos.com.', 'Desde abril de 2018, empezando en Viajemos.com.')} <a class="carta__volver" href="#ref-1" aria-label="${L('Back to note 1 in the text', 'Volver a la nota 1 en el texto')}">↩</a></p></li>
          <li id="nota-2"><span class="carta__n" aria-hidden="true">2</span><p>${L('Interkont S.A.S., since March 2026: front-end developer and AI agent orchestrator, from user stories with the client to front-end architecture.', 'Interkont S.A.S., desde marzo de 2026: desarrolladora front-end y orquestadora de agentes de IA, desde las historias de usuario con el cliente hasta la arquitectura front-end.')} <a class="carta__volver" href="#ref-2" aria-label="${L('Back to note 2 in the text', 'Volver a la nota 2 en el texto')}">↩</a></p></li>
          <li id="nota-3"><span class="carta__n" aria-hidden="true">3</span><p>${L('Lúmina Tech Colombia S.A.S., founded in Bogotá in January 2026. I’m its founder and legal representative.', 'Lúmina Tech Colombia S.A.S., fundada en Bogotá en enero de 2026. Soy su fundadora y representante legal.')} <a class="carta__volver" href="#ref-3" aria-label="${L('Back to note 3 in the text', 'Volver a la nota 3 en el texto')}">↩</a></p></li>
          <li id="nota-4"><span class="carta__n" aria-hidden="true">4</span><p>${L('Lúmina Campus, live since August 3, 2026. Shown here on a demo school with fictitious data, never a real one.', 'Lúmina Campus, en producción desde el 3 de agosto de 2026. Aquí se muestra sobre un colegio de demostración con datos ficticios, nunca sobre uno real.')} <a class="carta__volver" href="#ref-4" aria-label="${L('Back to note 4 in the text', 'Volver a la nota 4 en el texto')}">↩</a></p></li>
        </ol>
      </aside>
    </div>
  </section>`;
}
