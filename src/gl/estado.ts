/**
 * El estado que mueve la escena, sin three.js: main.ts lo importa desde el
 * primer momento y three.js tiene que seguir en su propio paquete, que se
 * descarga después del texto.
 *
 * Lo escribe la coreografía (GSAP, desde el scroll); el render lo suaviza por
 * su cuenta, así que un salto de scroll nunca se ve como un salto de partículas.
 */
export interface EstadoMundo {
  /** Fracción del semiancho visible: -1 borde izquierdo, 1 borde derecho. */
  x: number;
  /** Fracción del semialto visible: -1 abajo, 1 arriba. */
  y: number;
  scale: number;
  /** Opacidad global: baja cuando hay texto encima. */
  alpha: number;
  /** Giro extra que se suma al automático. */
  spin: number;
  /** Pesos de paleta: María · Lúmina Tech · Lúmina Campus (suman 1). */
  pM: number;
  pL: number;
  pC: number;
  /** 1 = la lupa de doble exposición está activa. */
  lente: number;
  /** Fuerza con la que el cursor aparta las partículas. */
  empuje: number;
}

export const estadoInicial = (): EstadoMundo => ({ x: 0, y: 0, scale: 1, alpha: 1, spin: 0, pM: 1, pL: 0, pC: 0, lente: 0, empuje: 0 });
export const CLAVES = Object.keys(estadoInicial()) as (keyof EstadoMundo)[];
