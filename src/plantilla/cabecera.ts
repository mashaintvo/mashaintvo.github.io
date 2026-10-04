import { PERFIL } from '../datos/perfil';
import { idioma, type Lang } from './util';

type T = ReturnType<typeof idioma>;

/**
 * El interruptor de los dos roles. Cada etiqueta va en la letra de su rol:
 * «Código» en monoespaciada, «Diseño» en la serif cursiva.
 */
export function modo(L: T, donde: string) {
  return `<div class="modo" role="group" aria-label="${L('Which role leads', 'Qué rol va delante')}" data-modo-grupo="${donde}">
    <button type="button" class="modo__op modo__op--c" data-modo-btn="codigo" aria-pressed="true">${L('Code', 'Código')}</button>
    <button type="button" class="modo__op modo__op--d" data-modo-btn="diseno" aria-pressed="false">${L('Design', 'Diseño')}</button>
  </div>`;
}

export const enlacesNav = (L: T) => [
  ['#trabajo', L('Work', 'Trabajo')],
  ['#metodo', L('Method', 'Método')],
  ['#indice', L('Skills', 'Conocimientos')],
  ['#contacto', L('Contact', 'Contacto')],
] as const;

export function renderNav(lang: Lang) {
  const L = idioma(lang);
  const otro = lang === 'es'
    ? { href: '/', lang: 'en', code: 'EN', nombre: 'English' }
    : { href: '/es/', lang: 'es', code: 'ES', nombre: 'Español' };
  const enlaces = enlacesNav(L);
  return `
  <header class="nav" data-nav>
    <a class="nav__marca" href="#inicio" aria-label="${L('María Sanjuán, back to the top', 'María Sanjuán, volver al inicio')}">
      <span class="nav__nombre"><b>maría</b> <span class="grad">sanjuán</span></span>
    </a>
    <p class="nav__corrida" aria-hidden="true"><span class="nav__corrida-n" data-corrida-n>00</span><span data-corrida>${L('Cover', 'Portada')}</span></p>
    <nav class="nav__menu" aria-label="${L('Main', 'Principal')}">
      <ul>${enlaces.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul>
    </nav>
    <div class="nav__acciones">
      ${modo(L, 'nav')}
      <a class="nav__idioma" href="${otro.href}" hreflang="${otro.lang}" lang="${otro.lang}"><span aria-hidden="true">${otro.code}</span><span class="sr-only">${otro.nombre}</span></a>
    </div>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
      <span class="nav__toggle-label">${L('Menu', 'Menú')}</span>
      <span class="nav__toggle-icon" aria-hidden="true"><i></i><i></i></span>
    </button>
  </header>

  <div class="menu" id="menu" hidden data-menu data-cerrar="${L('Close', 'Cerrar')}" data-abrir="${L('Menu', 'Menú')}">
    <nav aria-label="${L('Mobile menu', 'Menú móvil')}">
      <ol>${enlaces.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ol>
    </nav>
    <div class="menu__pie">
      ${modo(L, 'menu')}
      <a class="menu__idioma" href="${otro.href}" hreflang="${otro.lang}" lang="${otro.lang}">${otro.nombre}</a>
      <a class="menu__correo" href="mailto:${PERFIL.correo}">${PERFIL.correo}</a>
    </div>
  </div>`;
}
