/**
 * El monograma de María: una M y una S en un solo trazo, con sus cuatro
 * pasteles. Ella lo diseñó como render 3D (4 oct 2026); el sitio usa la
 * versión en vector redibujada sobre ese render, sin la curva aguamarina que
 * colgaba bajo la M (ella la tachó y aprobó el resultado).
 * Todo sale de tools/monograma.mjs (npm run monograma).
 */
import { TRAZO } from './datos/monograma-trazo';

export const MONOGRAMA = {
  /** vector puro, sin filtros: header, hoja de vida, 404 */
  plano: '/marca/monograma.svg',
  /** con sombra en el cruce y brillo de tubo: pantalla de carga, pie, tarjeta para redes */
  volumen: '/marca/monograma-volumen.svg',
  /** un solo color, con el hueco donde la S pasa por encima */
  lila: '/marca/monograma-lila.svg',
  /** ancho / alto */
  proporcion: TRAZO.ancho / TRAZO.alto,
} as const;

type Tipo = 'plano' | 'volumen' | 'lila';

/** <img> del monograma. Decorativo por defecto (alt vacío): al lado casi siempre va el nombre. */
export function imgMonograma(opts: { clase?: string; alt?: string; tipo?: Tipo; alto?: number; carga?: 'lazy' | 'eager' } = {}) {
  const alto = opts.alto ?? 100;
  const ancho = Math.round(alto * MONOGRAMA.proporcion);
  return `<img class="mono ${opts.clase ?? ''}" src="${MONOGRAMA[opts.tipo ?? 'plano']}" width="${ancho}" height="${alto}" alt="${opts.alt ?? ''}" decoding="async"${opts.carga ? ` loading="${opts.carga}"` : ''} />`;
}

/**
 * El monograma listo para dibujarse trazo a trazo: la imagen va enmascarada
 * por sus dos líneas centrales, y main.ts las recorre (dibujarMonograma).
 * Sin JavaScript se ve entero: la máscara arranca dibujada y es el script el
 * que la borra antes de animarla.
 */
export function svgDibujo(opts: { clase?: string; id: string; tipo?: Tipo }) {
  const { ancho, alto, grosor, m, s } = TRAZO;
  // Un pelo más ancha que el trazo, para no comerse el antialias del borde.
  const linea = `fill="none" stroke="#fff" stroke-width="${grosor + 4}" stroke-linecap="round" stroke-linejoin="round" pathLength="1"`;
  return `<svg class="mono mono--dibujo ${opts.clase ?? ''}" viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}" aria-hidden="true" focusable="false" data-dibujo>
    <defs><mask id="${opts.id}-trazo" maskUnits="userSpaceOnUse" x="0" y="0" width="${ancho}" height="${alto}">
      <path d="${m}" ${linea} data-trazo="m"/>
      <path d="${s}" ${linea} data-trazo="s"/>
    </mask></defs>
    <image href="${MONOGRAMA[opts.tipo ?? 'volumen']}" width="${ancho}" height="${alto}" mask="url(#${opts.id}-trazo)"/>
  </svg>`;
}
