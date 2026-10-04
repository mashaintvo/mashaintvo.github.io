/**
 * Las figuras que recorren las partículas. Cada una devuelve N puntos como
 * vec4: xyz + tono. Tonos con significado, que cada paleta pinta a su modo
 * (ver particulas.vert.glsl):
 *   0 base · 1 acento · 2 claro · 3 rosa · 4 luz
 *   10 + luminancia → el retrato: la luz de la foto decide el color
 *
 * Las cinco figuras de Lúmina (símbolo, red, onda, hélice, nudo) están
 * copiadas de luminahub-web/src/gl/shapes.ts —el motor del sitio de la
 * empresa— y adaptadas aquí: ese repositorio no se toca.
 */
import { muestra, type Retrato } from './retrato';

export type Forma = Float32Array;
const TAU = Math.PI * 2;

const lin = (c: number) => Math.pow(c / 255, 2.2);

/* ───────── 0 · el retrato hecho de código ───────── */

export interface Rejilla {
  n: number;
  forma: Forma;
  /** color real de la foto (lineal), para la cara de «diseño» */
  color: Float32Array;
  /** índice del glifo de cada partícula en el atlas */
  glifo: Float32Array;
  caracteres: string[];
  /** alto de una fila, en unidades del mundo: el tamaño de un glifo */
  fila: number;
}

/**
 * Filas de glifos recortadas por la silueta, como un bloque de texto: cada
 * fila es un trozo del código, y donde el código tiene un espacio, hay hueco.
 * La profundidad de la foto empuja cada glifo hacia la cámara.
 */
export function rejillaRetrato(r: Retrato, filas: number, codigo: string): Rejilla {
  const flujo = codigo.replace(/\s+/g, ' ');
  const caracteres = [...new Set(flujo.replace(/ /g, ''))];
  const HW = 6.4;
  const WW = HW * (r.w / r.h);
  const fila = HW / filas;
  const cols = Math.floor(WW / (fila * 0.6));
  const pos: number[] = [], col: number[] = [], gl: number[] = [];
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < cols; c++) {
      const ch = flujo[(f * cols + c + f * 17) % flujo.length];
      if (ch === ' ') continue;
      const u = (c + 0.5) / cols, v = (f + 0.5) / filas;
      const s = muestra(r, u, v);
      if (s.mask < 0.3) continue;
      pos.push((u - 0.5) * WW, (0.5 - v) * HW, (s.depth - 0.5) * 1.7, 10 + Math.min(0.999, s.lum));
      col.push(lin(s.r), lin(s.g), lin(s.b));
      gl.push(caracteres.indexOf(ch));
    }
  }
  return { n: gl.length, forma: new Float32Array(pos), color: new Float32Array(col), glifo: new Float32Array(gl), caracteres, fila };
}

/* ───────── el campo ───────── */

/**
 * Lo que queda del retrato al bajar: líneas de código sueltas que flotan a
 * distintas profundidades, como renglones de un texto que se deshizo. Es el
 * fondo del resto del sitio; al llegar al contacto, se vuelve a juntar.
 */
export function campo(n: number, fraccion = 0.82): Forma {
  const a = new Float32Array(n * 4);
  // Solo una parte del código se queda de fondo (más limpio); el resto sale
  // del cuadro por los lados al bajar desde el retrato. Quién se va lo decide
  // el azar, para que el retrato no se deshaga por franjas.
  const visibles = Math.floor(n * fraccion);
  const orden = Array.from({ length: n }, (_, k) => k);
  for (let k = n - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [orden[k], orden[j]] = [orden[j], orden[k]]; }
  for (let k = visibles; k < n; k++) {
    const lado = Math.random() < 0.5 ? -1 : 1;
    a.set([lado * (30 + Math.random() * 12), (Math.random() * 2 - 1) * 18, -6 + Math.random() * 4, 0], orden[k] * 4);
  }
  let i = 0;
  const pon = (x: number, y: number, z: number, t: number) => { a.set([x, y, z, t], orden[i] * 4); i++; };
  while (i < visibles) {
    const y = (Math.random() * 2 - 1) * 6.8;
    // Nada pegado a la cámara: de cerca, un glifo grande y borroso ensucia la página.
    const z = -11 + Math.random() * 9;
    const paso = 0.068;
    let x = -14 + Math.random() * 18;
    const largo = 6 + Math.floor(Math.random() * 54);
    const r = Math.random();
    const tono = r < 0.42 ? 0 : r < 0.62 ? 1 : r < 0.8 ? 3 : r < 0.9 ? 4 : 2;
    for (let k = 0; k < largo && i < visibles; k++) {
      x += paso;
      // Uno de cada seis caracteres es un espacio, como en el código de verdad.
      if (Math.random() < 0.16) continue;
      pon(x, y + (Math.random() - 0.5) * 0.012, z, tono);
    }
  }
  return a;
}

/* ───────── 2–6 · las figuras de Lúmina (copiadas de luminahub-web) ───────── */

function pointOnBox(size: number, cx: number, cy: number, out: number[]) {
  const h = size / 2;
  const face = Math.floor(Math.random() * 6);
  const u = (Math.random() * 2 - 1) * h;
  const v = (Math.random() * 2 - 1) * h;
  let x = 0, y = 0, z = 0;
  switch (face) {
    case 0: x = h; y = u; z = v; break;
    case 1: x = -h; y = u; z = v; break;
    case 2: y = h; x = u; z = v; break;
    case 3: y = -h; x = u; z = v; break;
    case 4: z = h; x = u; y = v; break;
    default: z = -h; x = u; y = v; break;
  }
  out[0] = cx + x;
  out[1] = cy + y;
  out[2] = z;
}

/**
 * El símbolo de Lúmina Tech: retícula 2×2 —tres cuadros perla y uno lima con
 * hueco—, en 3D. Proporciones del SVG oficial (viewBox 540): cuadros de 247,
 * separación de 45, hueco de 102. El hueco atraviesa el cubo lima: un túnel.
 */
export function simbolo(n: number): Forma {
  const a = new Float32Array(n * 4);
  const size = 1.25, h = size / 2;
  const off = (size + size * (45 / 247)) / 2;
  const hole = (size * (102 / 247)) / 2;
  const p = [0, 0, 0];
  const centers: [number, number][] = [[-off, off], [off, off], [-off, -off], [off, -off]];
  const aSides = 4 * size * size;
  const aRing = 2 * (size * size - (2 * hole) ** 2);
  const aTunnel = 4 * (2 * hole) * size;
  const total = aSides + aRing + aTunnel;
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    const c = r < 0.23 ? 0 : r < 0.46 ? 1 : r < 0.69 ? 2 : 3;
    const [cx, cy] = centers[c];
    if (c !== 3) {
      pointOnBox(size, cx, cy, p);
      a.set([p[0], p[1], p[2], 2], i * 4);
      continue;
    }
    const pick = Math.random() * total;
    let x: number, y: number, z: number;
    if (pick < aSides) {
      const u = (Math.random() * 2 - 1) * h, v = (Math.random() * 2 - 1) * h;
      switch (Math.floor(Math.random() * 4)) {
        case 0: x = h; y = u; z = v; break;
        case 1: x = -h; y = u; z = v; break;
        case 2: y = h; x = u; z = v; break;
        default: y = -h; x = u; z = v; break;
      }
    } else if (pick < aSides + aRing) {
      do {
        x = (Math.random() * 2 - 1) * h;
        y = (Math.random() * 2 - 1) * h;
      } while (Math.abs(x) < hole && Math.abs(y) < hole);
      z = Math.random() < 0.5 ? h : -h;
    } else {
      const u = (Math.random() * 2 - 1) * hole;
      z = (Math.random() * 2 - 1) * h;
      switch (Math.floor(Math.random() * 4)) {
        case 0: x = hole; y = u; break;
        case 1: x = -hole; y = u; break;
        case 2: y = hole; x = u; break;
        default: y = -hole; x = u; break;
      }
    }
    a.set([cx + x, cy + y, z, 1], i * 4);
  }
  return a;
}

/** Red neuronal: una esfera de Fibonacci con sinapsis que la cruzan por dentro. */
export function red(n: number): Forma {
  const a = new Float32Array(n * 4);
  const R = 2.3;
  const surface = Math.floor(n * 0.46);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < surface; i++) {
    const y = 1 - (i / (surface - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const jitter = 1 + (Math.random() - 0.5) * 0.06;
    a.set([Math.cos(th) * r * R * jitter, y * R * jitter, Math.sin(th) * r * R * jitter, Math.random() < 0.08 ? 2 : 0], i * 4);
  }
  const rand = () => {
    const u = Math.random() * 2 - 1, t = Math.random() * TAU, s = Math.sqrt(1 - u * u);
    return [Math.cos(t) * s * R, u * R, Math.sin(t) * s * R];
  };
  let i = surface;
  while (i < n) {
    const A = rand(), B = rand();
    const steps = 50 + Math.floor(Math.random() * 50);
    const r = Math.random();
    const tone = r < 0.07 ? 1 : r < 0.3 ? 2 : 0;
    const depth = 0.3 + Math.random() * 0.4;
    for (let k = 0; k < steps && i < n; k++, i++) {
      const t = k / steps;
      const bend = 1 - Math.sin(t * Math.PI) * depth;
      a.set([(A[0] + (B[0] - A[0]) * t) * bend, (A[1] + (B[1] - A[1]) * t) * bend, (A[2] + (B[2] - A[2]) * t) * bend, tone], i * 4);
    }
  }
  return a;
}

/** Lúmina Campus: un territorio ondulado — muchos nodos, una sola red. */
export function onda(n: number): Forma {
  const a = new Float32Array(n * 4);
  const side = Math.ceil(Math.sqrt(n));
  for (let i = 0; i < n; i++) {
    const gx = (i % side) / side - 0.5;
    const gz = Math.floor(i / side) / side - 0.5;
    const x = gx * 9;
    const z = gz * 7;
    const h = Math.sin(x * 0.9) * 0.35 + Math.cos(z * 1.3 + x * 0.4) * 0.3 + Math.sin(Math.hypot(x, z) * 1.6) * 0.18;
    const y = h - z * 0.42 - 0.4;
    a.set([x, y, z * 0.55, h > 0.48 ? 2 : 0], i * 4);
  }
  return a;
}

/** Lúmina Insight: doble hélice de datos. */
export function helice(n: number): Forma {
  const a = new Float32Array(n * 4);
  const turns = 3.2, H = 6, R = 1.15;
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    const t = Math.random();
    const ang = t * turns * TAU;
    const y = (t - 0.5) * H;
    if (r < 0.7) {
      const strand = r < 0.35 ? 0 : Math.PI;
      const rr = R + (Math.random() - 0.5) * 0.12;
      a.set([Math.cos(ang + strand) * rr, y, Math.sin(ang + strand) * rr, 0], i * 4);
    } else {
      const tq = Math.round(t * 46) / 46;
      const aq = tq * turns * TAU;
      const s = Math.random() * 2 - 1;
      a.set([Math.cos(aq) * R * s, (tq - 0.5) * H, Math.sin(aq) * R * s, Math.round(tq * 46) % 7 === 0 ? 1 : 2], i * 4);
    }
  }
  return a;
}

/** Lúmina Hub: un nudo toroidal (2,3) — lo hecho a la medida. */
export function nudo(n: number): Forma {
  const a = new Float32Array(n * 4);
  const p = 2, q = 3, R = 1.55, tube = 0.36;
  for (let i = 0; i < n; i++) {
    const t = Math.random() * TAU;
    const r = Math.cos(q * t) + 2;
    const cx = r * Math.cos(p * t) * R * 0.5;
    const cy = r * Math.sin(p * t) * R * 0.5;
    const cz = -Math.sin(q * t) * R * 0.5;
    const phi = Math.random() * TAU;
    const rad = tube * Math.sqrt(-2 * Math.log(Math.random() + 1e-6)) * 0.45;
    a.set([cx + Math.cos(phi) * rad, cy + Math.sin(phi) * rad, cz + Math.sin(phi * 1.7) * rad, Math.random() < 0.05 ? 1 : Math.random() < 0.2 ? 2 : 0], i * 4);
  }
  return a;
}
