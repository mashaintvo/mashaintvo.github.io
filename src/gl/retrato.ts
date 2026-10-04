/**
 * Los datos del retrato que prepara tools/retrato.mjs:
 *   datos.webp   R = luminancia · G = profundidad (1 = cerca) · B = máscara
 *   retrato.webp el color real de la foto, para la cara de «diseño»
 * Se leen en un canvas al tamaño del mapa de datos (los dos salen del mismo
 * encuadre, así que coinciden píxel a píxel).
 */
export interface Retrato {
  w: number;
  h: number;
  datos: Uint8ClampedArray;
  color: Uint8ClampedArray;
}

async function imagen(src: string) {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  await img.decode();
  return img;
}

function pixeles(img: HTMLImageElement, w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h).data;
}

export async function cargarRetrato(base = '/retrato/'): Promise<Retrato> {
  const [d, c] = await Promise.all([imagen(base + 'datos.webp'), imagen(base + 'retrato.webp')]);
  const w = d.naturalWidth, h = d.naturalHeight;
  return { w, h, datos: pixeles(d, w, h), color: pixeles(c, w, h) };
}

export function muestra(r: Retrato, u: number, v: number) {
  const x = Math.min(r.w - 1, Math.max(0, Math.round(u * (r.w - 1))));
  const y = Math.min(r.h - 1, Math.max(0, Math.round(v * (r.h - 1))));
  const i = (y * r.w + x) * 4;
  return {
    lum: r.datos[i] / 255,
    depth: r.datos[i + 1] / 255,
    mask: r.datos[i + 2] / 255,
    r: r.color[i],
    g: r.color[i + 1],
    b: r.color[i + 2],
  };
}
