import { anot, esc, idioma, type Lang } from './util';

/**
 * El método: cinco pasos, cada uno con una prueba de verdad tomada del
 * repositorio de Lúmina Campus (origin/master, 4 oct 2026). Las citas en
 * español son literales del CLAUDE.md o del código.
 */
export function renderMetodo(lang: Lang) {
  const L = idioma(lang);
  const pasos = [
    {
      n: 'I', t: L('Specify', 'Especificar'),
      d: L(
        'Every change starts as a written spec. In Lúmina Campus the rules live in CLAUDE.md and in a constitution of six non-negotiable principles, and the agents read them before writing a line.',
        'Todo cambio empieza como una especificación escrita. En Lúmina Campus las reglas viven en CLAUDE.md y en una constitución de seis principios no negociables, y los agentes las leen antes de escribir una línea.',
      ),
      prueba: `<p class="metodo__cita">${L('“Never a button that lies. If the feature doesn’t exist, it shows empty or “Coming soon”.”', '«Nunca un botón que miente. Si la función no existe, se muestra vacío o “Próximamente”.»')}</p><p class="metodo__fuente">CLAUDE.md · Lúmina Campus${L(' · translated from Spanish', '')}</p>`,
    },
    {
      n: 'II', t: L('Build with agents', 'Construir con agentes'),
      d: L(
        'Claude agents implement against the spec, in looping and prompting cycles; I orchestrate. One task, one branch, one pull request. At Interkont it is the whole team’s method.',
        'Los agentes de Claude implementan contra la especificación, en ciclos de looping y prompting; yo orquesto. Una tarea, una rama, un pull request. En Interkont es el método de todo el equipo.',
      ),
      prueba: `<pre class="metodo__codigo">${L('feat(chat): supervisor mode stops being an empty promise', 'feat(chat): el modo supervisor deja de ser una promesa vacía')}

Co-Authored-By: Claude Opus 5</pre><p class="metodo__fuente">${L('A real commit (translated from Spanish), with its co-author · Campus has more than 400 commits and more than 90 merged pull requests', 'Un commit real, con su coautor · Campus lleva más de 400 commits y más de 90 pull requests integrados')}</p>`,
    },
    {
      n: 'III', t: L('Guard', 'Vigilar'),
      d: L(
        'Today, sixteen automated guardians run in CI, and each one exists because something broke once. And the rule that keeps them honest: break them on purpose before trusting them.',
        'Hoy corren en CI dieciséis guardianes automáticos, y cada uno existe porque algo se rompió una vez. Y la regla que los mantiene honestos: romperlos a propósito antes de confiar en ellos.',
      ),
      prueba: `<ul class="metodo__lista">
        <li><code>check-button-wave.js</code><span>${L('fails if an action button shows up without its wave', 'falla si aparece un botón de acción sin onda')}</span></li>
        <li><code>check-permisos-datos.js</code><span>${L('no table is born reachable with the public key', 'ninguna tabla nace alcanzable con la clave pública')}</span></li>
        <li><code>check-siee.js</code><span>${L('walks all 251,001 possible pairs: TypeScript and Postgres round the same', 'recorre los 251.001 pares posibles: TypeScript y Postgres redondean igual')}</span></li>
      </ul>`,
    },
    {
      n: 'IV', t: L('Verify', 'Verificar'),
      d: L(
        'More than forty end-to-end test files in Playwright and more than 80 accessibility checks on every pull request. Verifying means running the path that changed: if nobody clicked it, it isn’t verified, and it isn’t reported as such.',
        'Más de cuarenta archivos de pruebas de punta a punta en Playwright y más de 80 revisiones de accesibilidad en cada pull request. Verificar es ejecutar el camino que cambió: si no se pulsó, no está verificado, y no se reporta como tal.',
      ),
      prueba: `<pre class="metodo__codigo">AUDITORIA=1 npx playwright test e2e/auditoria.spec.ts --workers=1</pre><p class="metodo__fuente">${L('The full WCAG 2.1 AA audit: five roles, desktop and mobile', 'La auditoría WCAG 2.1 AA completa: cinco roles, escritorio y móvil')}</p>`,
    },
    {
      n: 'V', t: L('People decide', 'Decidir: las personas'),
      d: L(
        'Product, UX and every sensitive decision stay human. The agents propose; I decide, and the decision is written down with its reason so the next session doesn’t undo it.',
        'El producto, la UX y toda decisión sensible siguen siendo humanos. Los agentes proponen; yo decido, y la decisión queda escrita con su motivo para que la siguiente sesión no la deshaga.',
      ),
      prueba: `<p class="metodo__cita">${L('“The decision that it be access with notice, and not a silent copy, is the CEO’s (Sep 7, 2026).”', '«La decisión de que fuera acceso con aviso, y no copia silenciosa, es de la CEO (7 sep 2026).»')}</p><p class="metodo__fuente">CLAUDE.md · ${L('on the chat’s supervisor mode · translated from Spanish', 'sobre el modo supervisor del chat')}</p>`,
    },
  ];
  return `
  <section class="metodo" id="metodo" aria-labelledby="metodo-t" data-seccion="${L('Method', 'Método')}">
    <div class="metodo__grid">
      <header class="metodo__cab">
        ${anot('<section id="metodo">', 'Manrope 300 · 0,94 · −5 %')}
        <h2 class="metodo__titulo" id="metodo-t" data-lineas>${L('How I work', 'Cómo trabajo')}<br><em>${L('with AI agents.', 'con agentes de IA.')}</em></h2>
        <p class="metodo__lead" data-revela>${L(
          'Spec-driven development (SDD) with multi-agent flows in Claude. It isn’t a tool on the side: it is how I build, every day. The evidence below comes from the Lúmina Campus repository.',
          'Desarrollo guiado por especificaciones (SDD) con flujos multiagente en Claude. No es una herramienta suelta: es como construyo, todos los días. Las pruebas de aquí abajo salen del repositorio de Lúmina Campus.',
        )}</p>
      </header>
      <ol class="metodo__pasos" data-anim="cascada">
        ${pasos.map((p) => `
        <li class="metodo__paso">
          <span class="metodo__n" aria-hidden="true">${p.n}</span>
          <div class="metodo__texto"><h3>${esc(p.t)}</h3><p>${p.d}</p></div>
          <div class="metodo__prueba">${p.prueba}</div>
        </li>`).join('')}
      </ol>
    </div>
  </section>`;
}
