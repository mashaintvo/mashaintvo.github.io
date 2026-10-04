import { PERFIL } from '../datos/perfil';
import { FORMACION, GRUPOS, IDIOMAS, TRABAJOS } from '../datos/trayectoria';
import { esc, idioma, type Lang } from '../plantilla/util';

/**
 * La hoja de vida, de los mismos datos que el portafolio (src/datos), para
 * que nunca se contradigan. tools/cv.mjs la imprime a PDF con Playwright.
 * Sobre Lúmina dice solo lo verificado en el repositorio: en producción desde
 * el 3 de agosto de 2026, sin afirmar pilotos ni clientes.
 */
export function renderCV(lang: Lang) {
  const L = idioma(lang);
  return `
  <main class="cv" lang="${lang === 'es' ? 'es-CO' : 'en'}">
    <header class="cv__cab">
      <div>
        <h1 class="cv__nombre">maría <em>sanjuán</em></h1>
        <p class="cv__nombre-completo">${PERFIL.nombreCompleto}</p>
        <p class="cv__titulo">${L('Frontend AI Developer &amp; UX/UI Designer', 'Desarrolladora front-end con IA &amp; diseñadora UX/UI')}</p>
      </div>
      <ul class="cv__contacto">
        <li>${PERFIL.correo}</li>
        <li>${PERFIL.whatsappVisible}</li>
        <li>Bogotá, Colombia · ${L('available for remote work', 'disponible en remoto')}</li>
        <li><b>mashaintvo.github.io</b></li>
        <li>linkedin.com/in/msanjuanherrera</li>
        <li>github.com/mashaintvo · behance.net/mashiverse</li>
      </ul>
    </header>

    <section class="cv__perfil">
      <p>${L(
        'Front-end developer and UX/UI designer with <b>more than 8 years</b> building interfaces remotely for companies in Spain, Germany and Colombia. I design in Figma and ship to production in React and Angular over REST APIs, with a focus on accessibility and responsive design. Today I develop with <b>multi-agent AI under spec-driven development (SDD)</b>: my daily way of working, not an add-on tool. Founder of an education technology company.',
        'Desarrolladora front-end y diseñadora UX/UI con <b>más de 8 años</b> construyendo interfaces en remoto para empresas de España, Alemania y Colombia. Diseño en Figma y llevo a producción en React y Angular sobre APIs REST, con foco en accesibilidad y responsive. Hoy desarrollo con <b>IA multiagente bajo metodología SDD</b> (desarrollo guiado por especificaciones): es mi forma de trabajar a diario, no una herramienta suelta. Fundadora de una empresa de tecnología educativa.',
      )}</p>
    </section>

    <div class="cv__cuerpo">
      <section class="cv__exp">
        <h2>${L('Experience', 'Experiencia')}</h2>
        <ol>
          ${TRABAJOS.map((t) => `
          <li>
            <p class="cv__fechas">${t.fechas[lang]}</p>
            <h3>${esc(t.rol[lang])}</h3>
            <p class="cv__empresa">${esc(t.empresa)}${t.lugar ? ` · ${t.lugar[lang]}` : ''}</p>
            ${t.id === 'lumina' ? `<p class="cv__logro">${L(
              'Lúmina Campus, a school management platform built on Colombian law: product, UX/UI, front-end architecture and development with AI agents. In production since August 3, 2026. Lúmina Hub: custom software and AI. Selected for the Bogotá Chamber of Commerce Startup Capital Raising Program.',
              'Lúmina Campus, plataforma de gestión escolar construida sobre la ley colombiana: producto, UX/UI, arquitectura front-end y desarrollo con agentes de IA. En producción desde el 3 de agosto de 2026. Lúmina Hub: software e IA a la medida. Seleccionada para el Programa de Levantamiento de Capital para Startups de la Cámara de Comercio de Bogotá.',
            )}</p>` : t.logro ? `<p class="cv__logro">${esc(t.logro[lang])}</p>` : ''}
          </li>`).join('')}
        </ol>
      </section>

      <aside class="cv__lado">
        <section>
          <h2>${L('AI-driven development', 'Desarrollo con IA')}</h2>
          <ul class="cv__puntos">
            <li>${L('<b>SDD</b> with multi-agent flows in Claude: the spec drives the work, and looping and prompting cycles iterate on it through to production code.', '<b>SDD</b> con flujos multiagente en Claude: la especificación guía el desarrollo, y los ciclos de looping y prompting iteran sobre ella hasta el código en producción.')}</li>
            <li>${L('<b>Custom agents and automations</b> with n8n, MCP and AWS Bedrock AgentCore.', '<b>Agentes y automatizaciones propias</b> con n8n, MCP y AWS Bedrock AgentCore.')}</li>
            <li>${L('<b>Guardrails in CI</b>: automated guardians, Playwright end-to-end tests and WCAG 2.1 AA audits on every pull request.', '<b>Guardianes en CI</b>: verificaciones automáticas, pruebas de punta a punta en Playwright y auditorías WCAG 2.1 AA en cada pull request.')}</li>
          </ul>
        </section>
        ${GRUPOS.map((g) => `
        <section>
          <h2>${g.nombre[lang]}</h2>
          <p class="cv__k cv__k--${g.id}">${g.items.map((i) => esc(i.nombre[lang])).join(' · ')}</p>
        </section>`).join('')}
        <section>
          <h2>${L('Education', 'Formación')}</h2>
          <ul class="cv__formacion">${FORMACION.map((f) => `<li><b>${esc(f.titulo[lang])}</b><span>${esc(f.donde)} · ${f.fechas}</span></li>`).join('')}</ul>
        </section>
        <section>
          <h2>${L('Languages', 'Idiomas')}</h2>
          <p>${IDIOMAS[lang]}</p>
        </section>
      </aside>
    </div>

    <footer class="cv__pie">${L('Interactive portfolio and case studies: mashaintvo.github.io', 'Portafolio y casos interactivos: mashaintvo.github.io')}</footer>
  </main>`;
}
