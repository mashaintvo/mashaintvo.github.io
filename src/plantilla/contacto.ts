import { PERFIL } from '../datos/perfil';
import { externo, idioma, type Lang } from './util';

/**
 * Hablemos: tres motivos, por igual (empleo, proyecto, Lúmina). Cada motivo
 * deja el mensaje escrito en el canal que se elija. Los enlaces funcionan sin
 * JavaScript con el primer motivo; main.ts los reescribe al cambiar de motivo.
 */
export function motivos(lang: Lang) {
  const L = idioma(lang);
  return [
    {
      id: 'empleo', etiqueta: L('A role on your team', 'Un puesto en tu equipo'),
      asunto: L('Job opportunity — María Sanjuán', 'Oportunidad laboral — María Sanjuán'),
      mensaje: L('Hi María, I saw your portfolio and I’d like to talk about a role on our team.', 'Hola, María. Vi tu portafolio y me gustaría hablar contigo sobre un puesto en nuestro equipo.'),
    },
    {
      id: 'proyecto', etiqueta: L('A project', 'Un proyecto'),
      asunto: L('Project inquiry — María Sanjuán', 'Proyecto — María Sanjuán'),
      mensaje: L('Hi María, I saw your portfolio and I have a project I’d like to talk about.', 'Hola, María. Vi tu portafolio y tengo un proyecto del que me gustaría hablarte.'),
    },
    {
      id: 'lumina', etiqueta: 'Lúmina',
      asunto: L('About Lúmina Tech', 'Sobre Lúmina Tech'),
      mensaje: L('Hi María, I’d like to talk about Lúmina Tech.', 'Hola, María. Me gustaría hablar contigo sobre Lúmina Tech.'),
    },
  ];
}

export const hrefCorreo = (asunto: string, mensaje: string) =>
  `mailto:${PERFIL.correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;
export const hrefWhatsapp = (mensaje: string) => `https://wa.me/${PERFIL.whatsapp}?text=${encodeURIComponent(mensaje)}`;

export function renderContacto(lang: Lang) {
  const L = idioma(lang);
  const ms = motivos(lang);
  const m0 = ms[0];
  return `
  <section class="contacto" id="contacto" aria-labelledby="contacto-t" data-seccion="${L('Contact', 'Contacto')}">
    <div class="contacto__grid">
      <h2 class="contacto__titulo" id="contacto-t"><span class="linea"><span>${L('Let’s', 'Hable')}</span></span><span class="linea"><span><em>${L('talk.', 'mos.')}</em></span></span></h2>
      <p class="contacto__lead" data-revela>${L('Tell me what it’s about and pick a channel: the message comes already written.', 'Cuéntame de qué se trata y elige un canal: el mensaje llega ya escrito.')}</p>

      <fieldset class="contacto__motivos" data-revela>
        <legend>${L('What is it about?', '¿De qué se trata?')}</legend>
        ${ms.map((m, i) => `<label class="motivo"><input type="radio" name="motivo" value="${m.id}" data-asunto="${m.asunto}" data-mensaje="${m.mensaje}" ${i === 0 ? 'checked' : ''} /><span>${m.etiqueta}</span></label>`).join('')}
      </fieldset>

      <ul class="contacto__canales" data-anim="cascada">
        <li><a class="canal" data-canal="correo" href="${hrefCorreo(m0.asunto, m0.mensaje)}"><span class="canal__n">${L('Email', 'Correo')}</span><span class="canal__v">${PERFIL.correo}</span><i aria-hidden="true">→</i></a></li>
        <li><a class="canal" data-canal="whatsapp" href="${hrefWhatsapp(m0.mensaje)}" target="_blank" rel="noopener"><span class="canal__n">WhatsApp</span><span class="canal__v">${PERFIL.whatsappVisible}</span><i aria-hidden="true">↗</i><span class="sr-only"> ${L('(opens in a new tab)', '(abre en una pestaña nueva)')}</span></a></li>
        <li>${externo(PERFIL.linkedin, `<span class="canal__n">LinkedIn</span><span class="canal__v">in/msanjuanherrera</span><i aria-hidden="true">↗</i>`, L, 'canal')}</li>
      </ul>

      <div class="contacto__extra" data-revela>
        <button type="button" class="enlace" data-copiar="${PERFIL.correo}" data-copiado="${L('Copied', 'Copiado')}">${L('Copy email', 'Copiar correo')}</button>
        <a class="enlace" href="/cv/maria-sanjuan-resume.pdf" download hreflang="en">Résumé <small>PDF · EN</small></a>
        <a class="enlace" href="/cv/maria-sanjuan-hoja-de-vida.pdf" download hreflang="es">Hoja de vida <small>PDF · ES</small></a>
      </div>
    </div>
  </section>`;
}
