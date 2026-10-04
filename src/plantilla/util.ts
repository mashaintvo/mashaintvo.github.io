/**
 * Ayudas de la plantilla. El sitio se escribe una vez, con los dos idiomas
 * uno al lado del otro (L('inglés', 'español')), y el plugin de vite.config.ts
 * lo vuelca en index.html y es/index.html al compilar. Todo el contenido
 * queda en el HTML: sin JavaScript se lee entero, y eso es lo que indexa Google.
 */
export type Lang = 'en' | 'es';

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Elige el texto del idioma de la página. */
export const idioma = (lang: Lang) => (en: string, es: string) => (lang === 'es' ? es : en);

export const ruta = (lang: Lang) => (lang === 'es' ? '/es/' : '/');

/**
 * La nota de los dos roles: lo que vería quien programa y lo que vería quien
 * diseña. El interruptor Código/Diseño decide cuál se muestra. Decorativa
 * para lectores de pantalla: el contenido ya está en el título.
 */
export const anot = (codigo: string, diseno: string) =>
  `<span class="anot" aria-hidden="true"><span class="anot__c">${esc(codigo)}</span><span class="anot__d">${esc(diseno)}</span></span>`;

/** Enlace externo, con aviso para lectores de pantalla. */
export const externo = (href: string, texto: string, L: ReturnType<typeof idioma>, clase = '') =>
  `<a class="${clase}" href="${href}" target="_blank" rel="noopener">${texto}<span class="sr-only"> ${L('(opens in a new tab)', '(abre en una pestaña nueva)')}</span></a>`;
