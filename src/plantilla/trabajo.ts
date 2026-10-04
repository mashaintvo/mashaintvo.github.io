import { contraste, formatoRatio } from '../datos/contraste';
import { FONDO_LUMINA, FORMAS_LUMINA, K_LUMINA, PALETA_LUMINA, guionConsola } from '../datos/lumina';
import {
  ASISTENCIA_AMARILLO, ASISTENCIA_ROJO, BOLETIN, CAIDA_TENDENCIA, CORTES, DESEMPENO_TEXTO, DIRECTORIO, NIVEL_TEXTO, NOMBRE_ROL, PRESETS_SAT, TOKENS_CAMPUS, YO,
  desempeno, evaluarSat, puedeEscribir, round1, type Rol,
} from '../datos/campus';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { anot, esc, externo, idioma, type Lang } from './util';

/** ¿Existe esta imagen en public/? (las plantillas corren al compilar, en Node) */
const existe = (ruta: string) => existsSync(resolve(process.cwd(), 'public', ruta.replace(/^\//, '')));

type T = ReturnType<typeof idioma>;

/**
 * Proyectos. Cada uno, en el mismo orden: portada con su pantalla real,
 * el recorrido por sus pantallas (en escritorio se desliza en horizontal al
 * bajar), sus demos por dentro en pestañas, y sus decisiones. Todo lo que se
 * mueve lo anima main.ts a partir de los data-* de aquí.
 */

/** Rótulo de datos ficticios. Va en el idioma de la página aunque la demo esté en español. */
function chipFicticio(L: T) {
  return `<span class="chip chip--ficticio" lang="${L('en', 'es')}">${L('Fictitious data', 'Datos ficticios')}</span>`;
}

/** Una ventana de navegador con su barra (los tres puntos llevan los pasteles del monograma). */
function navegador(url: string, img: string, alt: string, opts: { ancho?: number; alto?: number; carga?: 'lazy' | 'eager'; clase?: string } = {}) {
  const { ancho = 1440, alto = 900, carga = 'lazy', clase = '' } = opts;
  return `<div class="navegador ${clase}">
      <div class="navegador__barra" aria-hidden="true"><i></i><i></i><i></i><span>${url}</span></div>
      <div class="navegador__vista"><img src="${img}" width="${ancho}" height="${alto}" alt="${alt}" loading="${carga}" decoding="async" data-parallax-img /></div>
    </div>`;
}

type Pantalla = { img: string; titulo: string; nota: string; alt: string };

/** El recorrido: las pantallas en fila. Cada una se puede ver en grande. */
function recorrido(url: string, pantallas: Pantalla[], L: T, rotulo: string) {
  return `
    <div class="recorrido" data-horizontal aria-label="${rotulo}">
      <div class="recorrido__pista">
        ${pantallas.map((p, i) => `
        <figure class="recorrido__item">
          <button type="button" class="recorrido__abrir" data-ampliar="${p.img}" data-ampliar-alt="${esc(p.alt)}" data-cursor="${L('View', 'Ver')}" aria-label="${L('See larger', 'Ver en grande')}: ${esc(p.titulo)}">
            ${navegador(url, p.img, p.alt)}
          </button>
          <figcaption><span class="recorrido__n">${String(i + 1).padStart(2, '0')}</span><b>${p.titulo}</b> ${p.nota}</figcaption>
        </figure>`).join('')}
      </div>
    </div>`;
}

/** Las pestañas de demos. Sin JavaScript se ven todas, una debajo de otra. */
function demos(id: string, titulo: string, lead: string, items: { id: string; tab: string; html: string; pie: string }[]) {
  return `
    <div class="demos" data-tabs>
      <div class="demos__cab" data-revela>
        <h4 class="demos__titulo">${titulo}</h4>
        <p class="demos__lead">${lead}</p>
      </div>
      <div class="demos__pestanas" role="tablist" aria-label="${titulo}">
        ${items.map((d, i) => `<button type="button" role="tab" class="demos__tab" id="${id}-tab-${d.id}" aria-controls="${id}-panel-${d.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${d.tab}</button>`).join('')}
      </div>
      ${items.map((d) => `
      <div class="demos__panel" role="tabpanel" id="${id}-panel-${d.id}" aria-labelledby="${id}-tab-${d.id}">
        ${d.html}
        <p class="demos__pie" id="${id}-pie-${d.id}">${d.pie}</p>
      </div>`).join('')}
    </div>`;
}

function decisiones(items: { t: string; p: string }[]) {
  return `
    <ul class="decisiones" data-anim="cascada">
      ${items.map((d) => `<li class="decision"><p class="decision__t">${d.t}</p><p>${d.p}</p></li>`).join('')}
    </ul>`;
}

/* ═════════ entrada ═════════ */

function entrada(L: T) {
  return `
  <header class="trabajo__cab">
    ${anot('<section id="trabajo">', 'Manrope 300 · 0,94 · −5 %')}
    <h2 class="trabajo__titulo" id="trabajo-t" data-lineas>${L('Selected', 'Trabajo')} <em>${L('work.', 'seleccionado.')}</em></h2>
    <p class="trabajo__lead" data-revela>${L(
      'Two products I founded, designed and built with AI agents: my company’s website and the school platform. First the real screens; then the parts that matter, running right here with fictitious data.',
      'Dos productos que fundé, diseñé y construí con agentes de IA: el sitio de mi empresa y la plataforma escolar. Primero las pantallas reales; después, lo que importa funcionando aquí mismo, con datos ficticios.',
    )}</p>
    <ul class="trabajo__tarjetas" data-anim="cascada">
      <li><a class="tarjeta-proyecto" href="#lumina-tech" data-cursor="${L('Go', 'Ir')}">
        <span class="tarjeta-proyecto__img"><img src="/trabajo/lumina/portada.webp" width="1440" height="900" alt="" loading="lazy" decoding="async" /></span>
        <span class="tarjeta-proyecto__n">01</span>
        <span class="tarjeta-proyecto__nombre">Lúmina Tech</span>
        <span class="tarjeta-proyecto__que">${L('Brand and website · 2026', 'Marca y sitio web · 2026')}</span>
      </a></li>
      <li><a class="tarjeta-proyecto" href="#lumina-campus" data-cursor="${L('Go', 'Ir')}">
        <span class="tarjeta-proyecto__img"><img src="/trabajo/campus/login.webp" width="1440" height="900" alt="" loading="lazy" decoding="async" /></span>
        <span class="tarjeta-proyecto__n">02</span>
        <span class="tarjeta-proyecto__nombre">Lúmina Campus</span>
        <span class="tarjeta-proyecto__que">${L('School platform · live since Aug 2026', 'Plataforma escolar · en producción desde ago. 2026')}</span>
      </a></li>
    </ul>
  </header>`;
}

/* ═════════ 01 · Lúmina Tech ═════════ */

function casoTech(lang: Lang, L: T) {
  const ratio = (hex: string) => contraste(hex, FONDO_LUMINA);
  const paleta = PALETA_LUMINA.map((c) => {
    const r = ratio(c.hex);
    const aa = c.id === 'azul-noche' ? '' : `<span class="marca__ratio ${r >= 4.5 ? 'es-ok' : 'es-no'}">${formatoRatio(r, lang)} ${r >= 4.5 ? 'AA' : L('not for small text', 'no para texto pequeño')}</span>`;
    return `<li class="marca__color" style="--c:${c.hex}"><i aria-hidden="true"></i><b>${c.nombre[lang]}</b><code>${c.hex}</code>${aa}<small>${c.uso[lang]}</small></li>`;
  }).join('');
  const pruebas = PALETA_LUMINA.filter((c) => ['violeta', 'violeta-claro', 'perla', 'lima'].includes(c.id));
  const consolaTexto = guionConsola(lang).map((s) => s.t).join('');

  const pantallas: Pantalla[] = [
    { img: '/trabajo/lumina/manifiesto.webp', titulo: L('Manifesto', 'Manifiesto'), nota: L('Big type over a sphere of particles: AI doesn’t replace the teacher, it gives them time back.', 'Tipografía grande sobre una esfera de partículas: la IA no reemplaza al maestro, le devuelve el tiempo.'), alt: L('Manifesto section, text over a sphere of particles.', 'Sección del manifiesto, texto sobre una esfera de partículas.') },
    { img: '/trabajo/lumina/ia.webp', titulo: L('AI in action', 'IA en acción'), nota: L('The daily-plan console (paused, fictitious data) next to the early-warning light.', 'La consola del plan del día (en pausa, datos ficticios) junto al semáforo de alerta temprana.'), alt: L('A console labeled fictitious data and paused, next to an early-warning card with three fictitious students.', 'Una consola con los rótulos datos ficticios y en pausa, junto a una tarjeta de alerta temprana con tres estudiantes ficticios.') },
    { img: '/trabajo/lumina/campus.webp', titulo: L('Products', 'Productos'), nota: L('They scroll sideways, each one with its own shape. Campus: live.', 'Pasan de lado, cada uno con su figura. Campus: en producción.'), alt: L('Product card for Lúmina Campus, live, with its list of features.', 'Tarjeta de producto de Lúmina Campus, en producción, con su lista de funciones.') },
    { img: '/trabajo/lumina/confianza.webp', titulo: L('Trust', 'Confianza'), nota: L('The Colombian law behind each feature.', 'La ley colombiana detrás de cada función.'), alt: L('Trust section with cards for personal data, evaluation and school coexistence laws.', 'Sección de confianza con tarjetas de las leyes de datos personales, evaluación y convivencia escolar.') },
  ];
  const moviles = [
    ['movil-inicio', L('Home', 'Inicio')], ['movil-ia', L('AI in action', 'IA en acción')], ['movil-productos', L('Products', 'Productos')],
  ];

  return `
  <article class="proyecto proyecto--tech" id="lumina-tech" aria-labelledby="tech-t" data-seccion="Lúmina Tech">
    <header class="proyecto__cab">
      <p class="proyecto__num" data-revela><span>01</span> ${L('Website · 2026', 'Sitio web · 2026')}</p>
      <h3 class="proyecto__titulo" id="tech-t" data-lineas>Lúmina Tech, <em>${L('the website.', 'el sitio web.')}</em></h3>
      <p class="proyecto__resumen" data-revela>${L(
        'The website of my own company: AI-first, in 3D, and honest about what isn’t built yet.',
        'El sitio de mi propia empresa: con la IA al frente, en 3D, y honesto con lo que aún no existe.',
      )}</p>
      <dl class="proyecto__meta" data-anim="cascada">
        <div><dt>${L('Role', 'Rol')}</dt><dd>${L('Founder · product · UX/UI · front-end with AI agents', 'Fundadora · producto · UX/UI · front-end con agentes de IA')}</dd></div>
        <div><dt>${L('Stack', 'Tecnologías')}</dt><dd>Vite · TypeScript · three.js · GSAP · Lenis</dd></div>
        <div><dt>${L('Live', 'En vivo')}</dt><dd>${externo('https://luminahub.com.co', 'luminahub.com.co ↗', L, 'enlace-texto')}</dd></div>
      </dl>
    </header>

    <figure class="proyecto__portada" data-escala>
      ${navegador('luminahub.com.co', '/trabajo/lumina/portada.webp', L('The home page of luminahub.com.co.', 'La página de inicio de luminahub.com.co.'))}
    </figure>

    ${recorrido('luminahub.com.co', pantallas, L, L('The pages of luminahub.com.co', 'Las pantallas de luminahub.com.co'))}

    <div class="moviles">
      <p class="moviles__t" data-revela>${L('And on the phone', 'Y en el celular')}</p>
      <ul class="moviles__fila" data-anim="cascada">
        ${moviles.map(([f, t]) => `<li class="movil"><img src="/trabajo/lumina/${f}.webp" width="600" height="1298" alt="${L('luminahub.com.co on a phone', 'luminahub.com.co en un celular')}: ${t}" loading="lazy" decoding="async" /></li>`).join('')}
      </ul>
    </div>

    ${demos('tech', L('From the inside', 'Por dentro'), L('Four pieces of the site, running on this page.', 'Cuatro piezas del sitio, funcionando en esta página.'), [
      {
        id: 'motor', tab: L('Particle engine', 'Motor de partículas'),
        html: `
        <div class="demo__marco motor" data-demo="motor">
          <canvas class="motor__canvas" aria-hidden="true"></canvas>
          <img class="motor__poster" src="/brand/lumina/simbolo.svg" alt="" width="120" height="120" />
          <div class="motor__ui" role="group" aria-label="${L('Shape of the engine', 'Figura del motor')}">
            ${FORMAS_LUMINA.map((f, i) => `<button type="button" class="motor__op" data-forma="${i}" aria-pressed="${i === 0}"><span>${f[lang]}</span><small>${f.de[lang]}</small></button>`).join('')}
          </div>
          <span class="demo__sello">luminahub.com.co</span>
        </div>`,
        pie: L(
          'The particle engine from luminahub.com.co. Pick a shape: the symbol keeps the proportions of the official SVG, and its lime square becomes a tunnel. Move the cursor over it.',
          'El motor de partículas de luminahub.com.co. Elige una figura: el símbolo conserva las proporciones del SVG oficial, y su cuadro lima se vuelve un túnel. Pasa el cursor por encima.',
        ),
      },
      {
        id: 'consola', tab: L('AI console', 'Consola de IA'),
        html: `
        <div class="demo__marco consola" data-demo="consola">
          <div class="consola__barra">
            <span class="consola__t">${L('Daily plan · teacher', 'Plan del día · docente')}</span>
            <span class="chip">${L('Fictitious data', 'Datos ficticios')}</span>
            <span class="chip chip--pausa">${L('Paused', 'En pausa')}</span>
          </div>
          <pre class="consola__cuerpo" data-consola aria-hidden="true">${esc(consolaTexto)}</pre>
          <div class="sr-only">
            <p>${L('Demo with fictitious data of a teacher’s daily plan. This feature is paused.', 'Demostración con datos ficticios del plan del día para un docente. Esta función está en pausa.')}</p>
            <p>${L('High priority: math recovery in grade 9B. Six students are below 3.0; schedule a fractions review before Thursday.', 'Prioridad alta: recuperación en Matemáticas 9°B. Seis estudiantes están por debajo de 3,0; agendar un repaso de fracciones antes del jueves.')}</p>
            <p>${L('Reminder: pending grades for grade 10A. Twelve grades from worksheet 3 are missing to close the period.', 'Recordatorio: notas pendientes de 10°A. Faltan doce calificaciones del taller 3 para cerrar el período.')}</p>
          </div>
          <button type="button" class="consola__otra" data-consola-otra hidden>${L('Type it again', 'Escribir de nuevo')}</button>
        </div>`,
        pie: L(
          'The AI daily-plan console, as it appears on the site: the real shape of the response of POST /ai/daily-plan, fictitious data, and a “paused” label, because the feature is paused while it moves to a provider that accepts educational use with minors.',
          'La consola del plan del día con IA, como aparece en el sitio: la forma real de la respuesta de POST /ai/daily-plan, datos ficticios y el rótulo «En pausa», porque la función está en pausa mientras pasa a un proveedor que acepte su uso educativo con menores de edad.',
        ),
      },
      {
        id: 'marca', tab: L('Brand system', 'Sistema de marca'),
        html: `
        <div class="demo__marco marca" data-demo="marca">
          <ul class="marca__paleta">${paleta}</ul>
          <div class="marca__prueba">
            <p class="marca__muestra" data-marca-muestra style="color:#A9A6E3">${L('Small text on night blue: can you read it?', 'Texto pequeño sobre azul noche: ¿se lee?')}</p>
            <div class="marca__elige" role="radiogroup" aria-label="${L('Text color', 'Color del texto')}">
              ${pruebas.map((c) => {
                const r = ratio(c.hex);
                return `<label class="marca__radio"><input type="radio" name="marca-color" value="${c.hex}" data-ratio="${r.toFixed(2)}" ${c.id === 'violeta-claro' ? 'checked' : ''} /><span style="--c:${c.hex}">${c.nombre[lang]}</span></label>`;
              }).join('')}
            </div>
            <p class="marca__veredicto" data-marca-veredicto aria-live="polite">${formatoRatio(ratio('#A9A6E3'), lang)} · ${L('passes AA for small text (4.5:1)', 'cumple AA para texto pequeño (4,5:1)')}</p>
          </div>
          <div class="marca__tipos">
            <p class="marca__tipo marca__tipo--d">${L('Education that <em>thinks</em> with you.', 'La educación que <em>piensa</em> contigo.')}<small>Plus Jakarta Sans · ${L('headlines', 'titulares')}</small></p>
            <p class="marca__tipo marca__tipo--b">${L('AI-powered educational software for schools in Colombia.', 'Software educativo con IA para colegios en Colombia.')}<small>Inter · ${L('body', 'cuerpo')}</small></p>
            <p class="marca__tipo marca__tipo--m">POST /ai/daily-plan · ${L('3.0', '3,0')}<small>JetBrains Mono · ${L('figures and code', 'cifras y código')}</small></p>
          </div>
        </div>`,
        pie: L(
          'The brand system, with its contrast measured. Light violet exists because the medium violet does not reach 4.5:1 on night blue in small text. Try the four colors. Lime is scarce on purpose: primary button, headline keywords and the symbol’s square.',
          'El sistema de marca, con su contraste medido. El violeta claro existe porque el violeta medio no llega a 4,5:1 sobre azul noche en texto pequeño. Prueba los cuatro colores. El lima es escaso a propósito: botón principal, palabras clave de los titulares y el cuadro del símbolo.',
        ),
      },
      {
        id: 'coreo', tab: L('Scroll choreography', 'Coreografía del scroll'),
        html: `
        <div class="demo__marco coreo" data-demo="coreo">
          <div class="coreo__vista" aria-hidden="true"><div class="coreo__pantalla"><i class="coreo__figura" data-coreo-figura></i></div></div>
          <div class="coreo__panel">
            <label class="coreo__rango">
              <span>${L('Page scroll', 'Scroll de la página')} <output data-coreo-pct>0 %</output></span>
              <input type="range" min="0" max="1000" value="0" data-coreo-rango aria-describedby="tech-pie-coreo" />
            </label>
            <p class="coreo__seccion"><span>${L('Section', 'Sección')}</span> <b data-coreo-seccion>${K_LUMINA[0].seccion[lang]}</b></p>
            <pre class="coreo__codigo" data-coreo-codigo>${esc(K_LUMINA[0].codigo)}</pre>
            <dl class="coreo__estado" data-coreo-estado>
              ${(['morph', 'x', 'y', 'scale', 'alpha', 'spin'] as const).map((k) => `<div><dt>${k}</dt><dd data-k="${k}">${K_LUMINA[0].k[k].toFixed(2)}</dd></div>`).join('')}
            </dl>
            <div class="coreo__salto">
              <label class="coreo__check"><input type="checkbox" data-coreo-retraso /> <code>scrub: 1</code> ${L('(with delay)', '(con retraso)')}</label>
              <button type="button" class="coreo__btn" data-coreo-saltar>${L('Jump to contact (#contacto)', 'Saltar al contacto (#contacto)')}</button>
              <p class="coreo__resultado" data-coreo-resultado aria-live="polite"></p>
            </div>
          </div>
        </div>`,
        pie: L(
          'The scroll choreography, from the inside. Each section of the site has a state, and the scroll interpolates between the previous one and its own, always with explicit from/to values. x and y are fractions of the visible screen, so it works at any aspect ratio. Turn on the delayed scrub and jump: that bug happened.',
          'La coreografía del scroll, por dentro. Cada sección del sitio tiene un estado, y el scroll interpola entre el anterior y el suyo, siempre con valores explícitos de origen y destino. x e y son fracciones de la pantalla visible, así que funciona en cualquier proporción. Activa el scrub con retraso y salta: ese error pasó.',
        ),
      },
    ])}

    ${decisiones([
      { t: L('Content first', 'Primero el contenido'), p: L('All the text lives in the HTML; JavaScript only animates. Without JavaScript or WebGL the page still reads complete, and that is what Google indexes.', 'Todo el texto vive en el HTML; JavaScript solo anima. Sin JavaScript o sin WebGL la página se lee entera, y eso es lo que indexa Google.') },
      { t: L('Never promise more', 'Nunca prometer de más'), p: L('Insight says “Coming”; the AI plan says “Paused”. A clients section would only exist if it were true.', 'Insight dice «En camino»; el plan con IA dice «En pausa». Una sección de clientes solo existiría si fuera verdad.') },
    ])}
  </article>`;
}

/* ═════════ 02 · Lúmina Campus ═════════ */

/**
 * Las pantallas de la plataforma: capturas de María en el colegio de
 * demostración (datos inventados). Solo se muestran las que ya están en
 * public/trabajo/campus/; mientras no haya ninguna, la portada es la tarjeta
 * de Campus en luminahub.com.co.
 */
function pantallasCampus(L: T): Pantalla[] {
  const todas: Pantalla[] = [
    { img: '/trabajo/campus/mando-central.webp', titulo: L('Command center', 'Mando central'), nota: L('The demo school at a glance: enrollment, teachers, attendance and the risk observatory.', 'El colegio demo de un vistazo: matrícula, docentes, asistencia y el observatorio de riesgo.'), alt: L('Lúmina Campus command center for the demo school: 40 students, 4 teachers, 98% attendance and 7 students at risk.', 'Mando central de Lúmina Campus en el colegio demo: 40 estudiantes, 4 docentes, 98 % de asistencia y 7 estudiantes en riesgo.') },
    { img: '/trabajo/campus/observatorio.webp', titulo: L('Risk observatory', 'Observatorio de riesgo'), nota: L('Who is in red and why, with the notice to the parent one click away.', 'Quién está en rojo y por qué, con el aviso al acudiente a un clic.'), alt: L('Early-warning dashboard: 7 students in red and 2 in yellow, a risk-level chart and the students who need intervention.', 'Tablero de alerta temprana: 7 estudiantes en rojo y 2 en amarillo, una gráfica de niveles de riesgo y los estudiantes que requieren intervención.') },
    { img: '/trabajo/campus/servicio-social.webp', titulo: L('Social service', 'Servicio social'), nota: L('Resolution 4210 as a table: the 80 hours each 11th grader needs to graduate.', 'La Resolución 4210 hecha tabla: las 80 horas que cada estudiante de 11.° necesita para graduarse.'), alt: L('Social service table for grade 11 with hours per student and who still lacks hours.', 'Tabla de servicio social de grado 11 con las horas de cada estudiante y a quién le faltan.') },
    { img: '/trabajo/campus/convivencia.webp', titulo: L('School coexistence', 'Convivencia'), nota: L('Cases with their Law 1620 protocol: a type II case, open, on step 4 of 7.', 'Casos con su protocolo de la Ley 1620: uno tipo II, abierto, en el paso 4 de 7.'), alt: L('School coexistence screen with two cases and their protocol progress.', 'Pantalla de convivencia escolar con dos casos y el avance de su protocolo.') },
    { img: '/trabajo/campus/desempeno.webp', titulo: L('Family', 'Familia'), nota: L('What the parent sees: each child’s performance by subject and period, on the Decree 1290 scale.', 'Lo que ve el acudiente: el desempeño de cada hijo por área y período, con la escala del Decreto 1290.'), alt: L('Academic performance of a demo-school student by subject and period, with MEN performance levels.', 'Desempeño académico de un estudiante del colegio demo por área y período, con los niveles de desempeño del MEN.') },
  ];
  return todas.filter((p) => existe(p.img));
}

function casoCampus(lang: Lang, L: T) {
  const pantallas = pantallasCampus(L);
  const moviles = [
    ['movil-login', L('Sign in', 'Entrada')], ['movil-rectoria', L('Leadership', 'Rectoría')], ['movil-acudiente', L('Parent', 'Acudiente')],
  ].filter(([f]) => existe(`/trabajo/campus/${f}.webp`));
  const portada = pantallas[0]
    ? navegador('campus.luminahub.com.co', pantallas[0].img, pantallas[0].alt)
    : navegador('luminahub.com.co/#productos', '/trabajo/lumina/campus.webp', L('Lúmina Campus as presented on luminahub.com.co: live, with its list of features.', 'Lúmina Campus como se presenta en luminahub.com.co: en producción, con su lista de funciones.'));
  const p0 = PRESETS_SAT[0];
  const sat0 = evaluarSat({ promedio: p0.promedio, asistencia: p0.asistencia, tendencia: p0.tendencia, minimo: 3 }, lang);
  const nombreRol: Record<Rol, string> = { admin: NOMBRE_ROL.admin[lang], teacher: NOMBRE_ROL.teacher[lang], student: NOMBRE_ROL.student[lang], parent: NOMBRE_ROL.parent[lang] };
  const filasChat = (['admin', 'teacher', 'student', 'parent'] as Rol[]).map((r) => {
    const yo = YO[r];
    const destinos = DIRECTORIO.filter((c) => c.id !== yo).map((c) => {
      const p = puedeEscribir(yo, c.id);
      return `<li class="${p.si ? 'es-si' : 'es-no'}"><span>${esc(c.nombre[lang])}</span> ${p.si ? '✓' : '✕'}</li>`;
    }).join('');
    return `<div class="chat__estatico"><p><b>${nombreRol[r]}</b></p><ul>${destinos}</ul></div>`;
  }).join('');
  const notas = BOLETIN.map((b) => ({ ...b, d: desempeno(b.nota, 3) }));
  const promedio = round1(notas.reduce((s, b) => s + b.nota, 0) / notas.length);

  return `
  <article class="proyecto proyecto--campus" id="lumina-campus" aria-labelledby="campus-t" data-seccion="Lúmina Campus">
    <header class="proyecto__cab">
      <p class="proyecto__num" data-revela><span>02</span> ${L('Platform · live since Aug 3, 2026', 'Plataforma · en producción desde el 3 de agosto de 2026')}</p>
      <h3 class="proyecto__titulo" id="campus-t" data-lineas>Lúmina Campus, <em>${L('the platform.', 'la plataforma.')}</em></h3>
      <p class="proyecto__resumen" data-revela>${L(
        'A school platform built on Colombian law, for leadership, teachers, students and families.',
        'Una plataforma escolar construida sobre la ley colombiana, para directivos, docentes, estudiantes y familias.',
      )}</p>
      <dl class="proyecto__meta" data-anim="cascada">
        <div><dt>${L('Role', 'Rol')}</dt><dd>${L('Founder and product owner · UX/UI · front-end architecture · development with AI agents', 'Fundadora y dueña de producto · UX/UI · arquitectura front-end · desarrollo con agentes de IA')}</dd></div>
        <div><dt>${L('Stack', 'Tecnologías')}</dt><dd>React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Node.js · Express · PostgreSQL (Supabase) · Playwright</dd></div>
        <div><dt>${L('Here', 'Aquí')}</dt><dd>${L('Recreated on a demo school with fictitious data. No real school, student or minor.', 'Recreada sobre un colegio de demostración con datos ficticios. Ningún colegio, estudiante ni menor real.')}</dd></div>
      </dl>
      <ul class="proyecto__cifras" data-anim="cascada">
        <li><b data-contar="5">5</b> ${L('roles with their own permissions', 'roles con permisos propios')}</li>
        <li><b data-contar="13">13</b> ${L('core modules, included in every plan', 'módulos base, incluidos en todos los planes')}</li>
        <li><b data-contar="3">3</b> ${L('paid modules, already built', 'módulos de pago, ya construidos')}</li>
        <li><b data-contar="80" data-mas>80+</b> ${L('accessibility checks on every pull request', 'revisiones de accesibilidad en cada pull request')}</li>
      </ul>
    </header>

    <figure class="proyecto__portada" data-escala>
      ${portada}
    </figure>

    ${pantallas.length > 1 ? recorrido('campus.luminahub.com.co', pantallas.slice(1), L, L('The screens of Lúmina Campus, on the demo school', 'Las pantallas de Lúmina Campus, en el colegio de demostración')) : ''}

    ${moviles.length ? `
    <div class="moviles">
      <p class="moviles__t" data-revela>${L('And on the phone', 'Y en el celular')}</p>
      <ul class="moviles__fila" data-anim="cascada">
        ${moviles.map(([f, t]) => `<li class="movil"><img src="/trabajo/campus/${f}.webp" width="600" height="1298" alt="${L('Lúmina Campus on a phone', 'Lúmina Campus en un celular')}: ${t}" loading="lazy" decoding="async" /></li>`).join('')}
      </ul>
    </div>` : ''}

    ${demos('campus', L('From the inside', 'Por dentro'), L('Four pieces of the platform, rebuilt from its code with fictitious data.', 'Cuatro piezas de la plataforma, rehechas desde su código con datos ficticios.'), [
      {
        id: 'sat', tab: L('Early warning', 'Alerta temprana'),
        html: `
        <div class="demo__marco campus sat" data-demo="sat">
          <div class="campus__barra"><span class="campus__t">${L('Early Warning System', 'Sistema de Alerta Temprana')}</span>${chipFicticio(L)}</div>
          <div class="sat__grid">
            <div class="sat__controles">
              <div class="seg-lumina" role="group" aria-label="${L('Fictitious student', 'Estudiante ficticio')}">
                ${PRESETS_SAT.map((p, i) => `<button type="button" class="seg-lumina__opcion" data-sat-preset="${i}" data-activo="${i === 0}">${p.nombre[lang].split(' · ')[0]}</button>`).join('')}
              </div>
              <label class="campo-rango"><span>${L('Average', 'Promedio')} <output data-sat-out="promedio">${p0.promedio.toFixed(1)}</output></span><input type="range" min="0" max="5" step="0.1" value="${p0.promedio}" data-sat="promedio" /></label>
              <label class="campo-rango"><span>${L('Attendance', 'Asistencia')} <output data-sat-out="asistencia">${p0.asistencia} %</output></span><input type="range" min="0" max="100" step="1" value="${p0.asistencia}" data-sat="asistencia" /></label>
              <label class="campo-rango"><span>${L('Trend between periods', 'Tendencia entre períodos')} <output data-sat-out="tendencia">${p0.tendencia.toFixed(1)}</output></span><input type="range" min="-2" max="2" step="0.1" value="${p0.tendencia}" data-sat="tendencia" /></label>
              <label class="campo-rango campo-rango--colegio"><span>${L('School’s minimum grade', 'Nota mínima del colegio')} <output data-sat-out="minimo">3.0</output></span><input type="range" min="2" max="4" step="0.1" value="3" data-sat="minimo" /></label>
            </div>
            <div class="sat__resultado">
              <div class="semaforo" data-nivel="${sat0.nivel}" data-sat-semaforo aria-hidden="true"><i></i><i></i><i></i></div>
              <p class="sat__nivel" data-sat-nivel aria-live="polite">${NIVEL_TEXTO[sat0.nivel][lang]}</p>
              <ul class="sat__motivos" data-sat-motivos>${sat0.motivos.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
              <button type="button" class="btn-lumina btn-campus" data-sat-avisar>${L('Notify the parent', 'Avisar al acudiente')}</button>
              <ol class="sat__registro" data-sat-registro aria-live="polite"></ol>
            </div>
          </div>
          <pre class="sat__regla"><code>${L(
            `if (attendance &lt; ${ASISTENCIA_ROJO} || average &lt; minimum) return 'RED'
if (attendance &lt; ${ASISTENCIA_AMARILLO} || trend &lt;= -${CAIDA_TENDENCIA}) return 'YELLOW'
return 'GREEN'`,
            `if (asistencia &lt; ${ASISTENCIA_ROJO} || promedio &lt; minimo) return 'ROJO'
if (asistencia &lt; ${ASISTENCIA_AMARILLO} || tendencia &lt;= -${CAIDA_TENDENCIA}) return 'AMARILLO'
return 'VERDE'`,
          )}</code></pre>
        </div>`,
        pie: L(
          'The early-warning traffic light, with the product’s real rules and real reason texts. Move the sliders. The school’s minimum grade is not a constant: it comes from each school’s evaluation system (Decree 1290, art. 8). With 3.0 hard-coded, a school that requires 3.5 saw in green a student its own report card failed.',
          'El semáforo de alerta temprana, con las reglas y los textos de motivo reales del producto. Mueve los controles. La nota mínima no es una constante: sale del sistema de evaluación de cada colegio (Decreto 1290, art. 8). Con un 3,0 escrito en el código, un colegio que exige 3,5 veía en verde a quien su propio boletín daba por reprobado.',
        ),
      },
      {
        id: 'chat', tab: L('Chat by role', 'Chat por rol'),
        html: `
        <div class="demo__marco campus chat" data-demo="chat">
          <div class="campus__barra"><span class="campus__t">${L('Directory and chat', 'Directorio y chat')}</span>${chipFicticio(L)}</div>
          <div class="chat__grid">
            <div class="chat__lado">
              <p class="chat__como">${L('View as', 'Ver como')}</p>
              <div class="seg-lumina" role="group" aria-label="${L('See the directory as', 'Ver el directorio como')}">
                ${(['admin', 'teacher', 'student', 'parent'] as Rol[]).map((r, i) => `<button type="button" class="seg-lumina__opcion" data-chat-rol="${r}" data-activo="${i === 1}">${NOMBRE_ROL[r][lang]}</button>`).join('')}
              </div>
              <label class="chat__supervisor"><input type="checkbox" data-chat-supervisor class="sr-only" /><span class="check-lumina" aria-hidden="true"></span> ${L('Minor protection (supervisor mode)', 'Protección de menores (modo supervisor)')}</label>
              <ul class="chat__directorio" data-chat-directorio></ul>
            </div>
            <div class="chat__panel" data-chat-panel aria-live="polite">
              <p class="chat__vacio">${L('Pick someone from the directory.', 'Elige a alguien del directorio.')}</p>
            </div>
          </div>
          <div class="chat__sinjs">${filasChat}</div>
        </div>`,
        pie: L(
          'Who can write to whom. The matrix is enforced on the server: the directory only lists allowed contacts, and opening a conversation outside the matrix returns a 403. Turn on minor protection: the parent can read their child’s conversations, without a voice, the student sees a permanent notice, and every read is audited. “Watching is not impersonating.”',
          'Quién puede escribirle a quién. La matriz se aplica en el servidor: el directorio solo lista contactos permitidos, y abrir una conversación fuera de ella devuelve un 403. Activa la protección de menores: el acudiente puede leer las conversaciones de su hijo, sin voz, el estudiante ve un aviso permanente y cada lectura queda auditada. «Vigilar no es suplantar».',
        ),
      },
      {
        id: 'boletin', tab: L('Report card', 'Boletín'),
        html: `
        <div class="demo__marco campus boletin" data-demo="boletin">
          <div class="campus__barra"><span class="campus__t">${L('Report card · Decree 1290', 'Boletín · Decreto 1290')}</span>${chipFicticio(L)}</div>
          <div class="boletin__hoja">
            <header class="boletin__cab">
              <p class="boletin__colegio">${L('Demo school', 'Colegio de demostración')}</p>
              <p class="boletin__titulo">${L('Academic report card', 'Boletín académico de calificaciones')}</p>
              <p class="boletin__meta">${L('Period 2 of 4 · School year 2026 · Scale 0.0–5.0 (Decree 1290/2009)', 'Período 2 de 4 · Año lectivo 2026 · Escala 0.0–5.0 (Decreto 1290/2009)')}</p>
              <p class="boletin__est"><span>${L('Student 07', 'Estudiante 07')}</span><span>${L('Group 9A', 'Grupo 9°A')}</span></p>
            </header>
            <table class="boletin__tabla">
              <thead><tr><th scope="col">${L('Subject', 'Asignatura')}</th><th scope="col">${L('Teacher', 'Docente')}</th><th scope="col">${L('Grade', 'Nota')}</th><th scope="col">${L('Performance', 'Desempeño')}</th></tr></thead>
              <tbody>
                ${notas.map((b, i) => `<tr data-fila="${i}"><th scope="row">${b.asignatura[lang]}</th><td>${b.docente}</td><td><input class="boletin__nota" type="number" min="0" max="5" step="0.1" value="${b.nota.toFixed(1)}" aria-label="${L(`Grade for ${b.asignatura.en}`, `Nota de ${b.asignatura.es}`)}" data-nota="${i}" /></td><td><span class="desempeno" data-d="${b.d}" data-desempeno="${i}">${DESEMPENO_TEXTO[b.d][lang]}${b.d === 'Bajo' ? ` <small>${L('(Failed)', '(No aprobada)')}</small>` : ''}</span></td></tr>`).join('')}
              </tbody>
            </table>
            <div class="boletin__pie">
              <p>${L('Period average', 'Promedio del período')} <b data-boletin-promedio>${promedio.toFixed(1)}</b></p>
              <label class="boletin__minimo">${L('Minimum grade', 'Nota mínima')} <input type="number" min="1" max="4.5" step="0.1" value="3.0" data-boletin-minimo /></label>
              <p class="boletin__cortes" data-boletin-cortes>${DESEMPENO_TEXTO.Superior[lang]} ≥ ${CORTES.superior.toFixed(1)} · ${DESEMPENO_TEXTO.Alto[lang]} ≥ ${CORTES.alto.toFixed(1)} · ${DESEMPENO_TEXTO.Básico[lang]} ≥ 3.0 · ${DESEMPENO_TEXTO.Bajo[lang]} &lt; 3.0</p>
            </div>
          </div>
        </div>`,
        pie: L(
          'A report card by MEN performance levels. Edit any grade, or the school’s minimum. “Basic” falls on that minimum by definition: it is the level of someone who passes by a hair. Averages round to one decimal with half away from zero, exactly like Postgres: a CI guardian walks all 251,001 possible pairs to prove TypeScript and the database agree.',
          'Un boletín por desempeños del MEN. Edita cualquier nota, o la nota mínima del colegio. «Básico» cae en esa mínima por definición: es el desempeño de quien aprueba raspando. Los promedios se redondean a un decimal con la mitad hacia afuera del cero, igual que Postgres: un guardián de CI recorre los 251.001 pares posibles para probar que TypeScript y la base de datos coinciden.',
        ),
      },
      {
        id: 'ds', tab: L('Design system', 'Sistema de diseño'),
        html: `
        <div class="demo__marco campus ds" data-demo="ds">
          <div class="campus__barra"><span class="campus__t">${L('Design system', 'Sistema de diseño')}</span><span class="chip">Tailwind CSS v4</span></div>
          <ul class="ds__tokens">${TOKENS_CAMPUS.map((t) => `<li style="--c:${t.hex}"><i aria-hidden="true"></i><code>${t.token}</code><small>${t.hex} · ${t.uso[lang]}</small></li>`).join('')}</ul>
          <div class="ds__fila">
            <p class="ds__rotulo">${L('Buttons with a wave', 'Botones con onda')}</p>
            <div class="ds__botones">
              <button type="button" class="btn-lumina btn-campus">${L('Publish', 'Publicar')}</button>
              <button type="button" class="btn-lumina btn-campus btn-campus--coral">${L('Save grades', 'Guardar notas')}</button>
              <button type="button" class="btn-lumina btn-campus btn-campus--borde">${L('Cancel', 'Cancelar')}</button>
            </div>
          </div>
          <div class="ds__fila">
            <p class="ds__rotulo">${L('Tabs with sparks', 'Pestañas con chispas')}</p>
            <div class="seg-lumina" role="group" aria-label="${L('Period', 'Período')}">
              ${[1, 2, 3, 4].map((n) => L(`Period ${n}`, `Período ${n}`)).map((p, i) => `<button type="button" class="seg-lumina__opcion" data-seg-ds data-activo="${i === 1}">${p}</button>`).join('')}
            </div>
          </div>
          <div class="ds__fila ds__campos">
            <p class="ds__rotulo">${L('Focus isn’t red', 'El foco no es rojo')}</p>
            <label class="ds__campo"><span>${L('Typing', 'Escribiendo')}</span><input type="text" value="Gloria Navarro" /></label>
            <label class="ds__campo"><span>Error</span><input type="email" value="gloria@" aria-invalid="true" /></label>
            <label class="ds__campo"><span>${L('Valid', 'Correcto')}</span><input type="email" value="gloria@colegio.edu.co" required data-valido /></label>
            <label class="ds__check"><input type="checkbox" class="sr-only" checked /><span class="check-lumina" aria-hidden="true"></span> ${L('A checkbox that turns into a tick', 'Casilla que se vuelve palomita')}</label>
          </div>
        </div>`,
        pie: L(
          'Campus’s design system, rebuilt from its CSS. Every action button gets a wave, the tabs give off sparks once and stop, and the focus outline is slate, not coral: people read the coral focus as an error. Red means error, and only error.',
          'El design system de Campus, rehecho desde su CSS. Todo botón de acción lleva onda, las pestañas sueltan chispas una vez y paran, y el contorno del foco es pizarra, no coral: la gente leía el foco coral como un error. El rojo significa error, y solo error.',
        ),
      },
    ])}

    <div class="proceso">
      <h4 class="proceso__t" data-revela>${L('Process', 'Proceso')}</h4>
      <dl class="proceso__lista" data-anim="cascada">
        <div><dt>${L('Research and law', 'Investigación y normas')}</dt><dd>${L(
          'The law became screens: the 0.0–5.0 scale and MEN levels (Decree 1290), step-by-step coexistence protocols with the confidentiality of art. 44 (Law 1620, Decree 1965), PIAR adjustments printed on the report card (Decree 1421), a graduation certificate that refuses to issue without the 80 hours of social service (Resolution 4210), and versioned, revocable consent (Law 1581).',
          'La ley se volvió pantallas: la escala 0,0–5,0 y los desempeños del MEN (Decreto 1290), protocolos de convivencia paso a paso con la reserva del art. 44 (Ley 1620, Decreto 1965), los ajustes del PIAR impresos en el boletín (Decreto 1421), un acta de grado que se niega a salir sin las 80 horas de servicio social (Resolución 4210) y una autorización de datos versionada y revocable (Ley 1581).',
        )}</dd></div>
        <div><dt>${L('Decisions with their why', 'Decisiones con su porqué')}</dt><dd>${L(
          'Never a button that lies: if a feature doesn’t exist, it says “Coming soon”. A zero while loading also lies, so an empty space waits instead. And the report card and graduation certificate are never behind a paid module, because issuing them is a legal obligation.',
          'Nunca un botón que miente: si una función no existe, dice «Próximamente». Un cero mientras carga también miente, así que espera un hueco. Y el boletín y el acta de grado nunca quedan detrás de un módulo de pago, porque emitirlos es una obligación legal.',
        )}</dd></div>
        <div><dt>${L('Accessibility, WCAG 2.1 AA', 'Accesibilidad, WCAG 2.1 AA')}</dt><dd>${L(
          'Required in Colombia by Resolution 1519 of 2020. Every pull request runs more than 80 automated checks: every screen of the five roles on desktop (1280 × 800) and mobile (390 × 844). A serious violation, a horizontal overflow or a clipped text fails the build.',
          'Obligatoria en Colombia por la Resolución 1519 de 2020. Cada pull request corre más de 80 revisiones automáticas: todas las pantallas de los cinco roles en escritorio (1280 × 800) y en móvil (390 × 844). Una violación grave, un desborde horizontal o un texto cortado tumban el build.',
        )}</dd></div>
        <div><dt>${L('Responsible AI', 'IA responsable')}</dt><dd>${L(
          'AI suggests, people decide: no grade, promotion or sanction is decided by an automated system. The AI runs on the server, so no key or sensitive data reaches the browser. The early-warning light works today with clear rules, not AI, and the AI daily plan is paused while it moves to a provider that accepts educational use with minors.',
          'La IA sugiere y las personas deciden: ninguna nota, promoción o sanción la decide un sistema automático. La IA corre en el servidor, así que ninguna clave ni dato sensible llega al navegador. El semáforo de alerta temprana funciona hoy con reglas claras, no con IA, y el plan del día con IA está en pausa mientras pasa a un proveedor que acepte su uso educativo con menores de edad.',
        )}</dd></div>
      </dl>
    </div>

    ${decisiones([
      { t: L('The parent reads with notice', 'El acudiente lee con aviso'), p: L('Not in silence. A minor who doesn’t know they’re being read talks as if they weren’t, and if the problem is at home, silent surveillance hands it to the wrong person.', 'No en silencio. Un menor que no sabe que lo leen habla como si no lo leyeran, y si el problema está en casa, la vigilancia callada se lo entrega justo a quien no debe.') },
    ])}
  </article>`;
}

export function renderTrabajo(lang: Lang) {
  const L = idioma(lang);
  return `
  <section class="trabajo" id="trabajo" aria-labelledby="trabajo-t" data-seccion="${L('Work', 'Trabajo')}">
    ${entrada(L)}
    ${casoTech(lang, L)}
    ${casoCampus(lang, L)}
  </section>
  <dialog class="visor" data-visor aria-label="${L('Screen, larger', 'Pantalla en grande')}">
    <img data-visor-img alt="" />
    <form method="dialog"><button class="visor__cerrar" type="submit" data-cursor="${L('Close', 'Cerrar')}">${L('Close', 'Cerrar')} <span aria-hidden="true">✕</span></button></form>
  </dialog>`;
}
