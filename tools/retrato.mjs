/**
 * Prepara el retrato a partir de la foto original (assets-src/, fuera de git).
 *
 *   npm run retrato
 *
 * Todo corre en local: la foto no sale de esta máquina. Los modelos se
 * descargan una vez a .cache/ (también fuera de git).
 *
 * 1. Recorte de la persona con MODNet (matting de retratos, Apache-2.0):
 *    fuera el fondo y el marco ovalado; «solo yo».
 * 2. Profundidad con Depth Anything V2 small (Apache-2.0): es lo que convierte
 *    el retrato de código en un relieve 3D y no en una imagen plana.
 * 3. Salidas en public/retrato/:
 *    - retrato.webp   la persona recortada, con transparencia (poster, OG, sin WebGL)
 *    - datos.webp     mapa compacto para las partículas, sin alfa:
 *                     R = luminancia · G = profundidad (1 = cerca) · B = máscara
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { AutoModel, AutoProcessor, RawImage, env, pipeline } from '@huggingface/transformers';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(root, 'assets-src/retrato-original.jpg');
const OUT = resolve(root, 'public/retrato');
const DEBUG = resolve(root, 'assets-src/debug');

env.cacheDir = resolve(root, '.cache/modelos');
env.allowLocalModels = false;

await mkdir(OUT, { recursive: true });
await mkdir(DEBUG, { recursive: true });

const meta = await sharp(SRC).metadata();
const W = meta.width, H = meta.height;
console.log(`original ${W}×${H}`);

/* ───────── 1. recorte (MODNet) ───────── */
console.log('recorte: cargando MODNet…');
const matModel = await AutoModel.from_pretrained('Xenova/modnet', { dtype: 'fp32' });
const matProc = await AutoProcessor.from_pretrained('Xenova/modnet');
const image = await RawImage.read(SRC);
const { pixel_values } = await matProc(image);
const { output } = await matModel({ input: pixel_values });
const matte = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(W, H);
const alpha = Buffer.from(matte.data); // 1 canal, W×H

/* MODNet se lleva consigo el arco inferior del marco y un hilo del neón que
   queda junto a la mano. Tres correcciones, medidas sobre ESTA foto
   (assets-src/debug/ovalo.cjs dibuja el óvalo encima para ajustarlo):
   1. Solo lo que está dentro del óvalo interior del espejo, con borde suave.
   2. Fuera el neón: píxeles muy brillantes y magenta/blancos en su franja.
   3. Desvanecido inferior: el busto se funde con el fondo, como en un retrato. */
const OVALO = { cx: 905, cy: 1177, a: 712, b: 1092, rot: (2.5 * Math.PI) / 180 };
const NEON = { x0: 1290, x1: 1420, y0: 250, y1: 1260 };
const FADE = { y0: 1700, y1: 2050 };
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
{
  const px = await sharp(SRC).removeAlpha().raw().toBuffer();
  const cos = Math.cos(OVALO.rot), sin = Math.sin(OVALO.rot);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!alpha[i]) continue;
      // 1. óvalo (en coordenadas del óvalo girado); el borde se suaviza ~1,5 %
      const dx = x - OVALO.cx, dy = y - OVALO.cy;
      const u = (dx * cos + dy * sin) / OVALO.a, v = (-dx * sin + dy * cos) / OVALO.b;
      let k = 1 - smooth(0.97, 1.0, Math.sqrt(u * u + v * v));
      const r = px[i * 3], g = px[i * 3 + 1], b = px[i * 3 + 2];
      // 1b. el filo dorado del marco que queda justo dentro del óvalo: solo en
      //     el anillo exterior, donde lo único que hay de ella es el vestido negro
      const ro = Math.sqrt(u * u + v * v);
      if (ro > 0.88) {
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        const hue = mx === mn ? 0 : mx === r ? (((g - b) / (mx - mn)) % 6) * 60 : mx === g ? ((b - r) / (mx - mn) + 2) * 60 : ((r - g) / (mx - mn) + 4) * 60;
        const h = hue < 0 ? hue + 360 : hue;
        if (mx > 64 && (mx - mn) / mx > 0.3 && h >= 8 && h <= 60) k = 0;
        // las perlas del marco son pálidas y el dorado no las caza; abajo, junto
        // al borde, todo lo claro es marco (el vestido es negro)
        if (y > 1550 && ro > 0.9 && mx > 90) k = 0;
      }
      // 2. neón: solo donde MODNet dudaba (borde), para no morder la mano
      if (x >= NEON.x0 && x <= NEON.x1 && y >= NEON.y0 && y <= NEON.y1 && alpha[i] < 250) {
        const neon = (b > 190 && g < 100) || Math.min(r, g, b) > 235;
        if (neon) k = 0;
      }
      // 3. desvanecido inferior
      k *= 1 - smooth(FADE.y0, FADE.y1, y);
      alpha[i] = Math.round(alpha[i] * k);
    }
  }
  // Un desenfoque mínimo quita los dientes que dejan los cortes por color.
  const soft = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } })
    .toColourspace('b-w').blur(0.8).raw().toBuffer();
  soft.copy(alpha);
}
// Ojo: sharp pasa a sRGB (3 canales) todo lo que redimensiona o guarda, salvo
// que se le pida 'b-w'. Sin esto, una máscara de 1 canal se lee rayada.
const gray = (buf) => sharp(buf, { raw: { width: W, height: H, channels: 1 } }).toColourspace('b-w');
await gray(alpha).png().toFile(resolve(DEBUG, 'mascara.png'));

/* ───────── 2. profundidad (Depth Anything V2) ───────── */
console.log('profundidad: cargando Depth Anything V2 small…');
const estimator = await pipeline('depth-estimation', 'onnx-community/depth-anything-v2-small', { dtype: 'fp32' });
const { depth } = await estimator(image);
const depthFull = await depth.resize(W, H);
const depthBuf = Buffer.from(depthFull.data);
await gray(depthBuf).png().toFile(resolve(DEBUG, 'profundidad.png'));

/* ───────── 3. encuadre: la caja de la persona, con aire ───────── */
let x0 = W, y0 = H, x1 = 0, y1 = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (alpha[y * W + x] > 128) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
}
const pad = Math.round((x1 - x0) * 0.04);
const box = {
  left: Math.max(0, x0 - pad),
  top: Math.max(0, y0 - pad),
  width: Math.min(W, x1 + pad) - Math.max(0, x0 - pad),
  height: Math.min(H, y1 + pad) - Math.max(0, y0 - pad),
};
console.log('caja de la persona', box);

const rgb = await sharp(SRC).removeAlpha().raw().toBuffer();
const rgba = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  rgba[i * 4] = rgb[i * 3];
  rgba[i * 4 + 1] = rgb[i * 3 + 1];
  rgba[i * 4 + 2] = rgb[i * 3 + 2];
  rgba[i * 4 + 3] = alpha[i];
}
const cut = sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).extract(box);

await cut.clone().resize({ height: 1400 }).webp({ quality: 86, alphaQuality: 90 }).toFile(resolve(OUT, 'retrato.webp'));
await cut.clone().resize({ height: 900 }).png().toFile(resolve(DEBUG, 'recorte.png'));

/* ───────── 4. mapa de datos para las partículas ─────────
   Resolución baja a propósito: cada píxel es una partícula candidata, y el
   archivo pesa poco. La profundidad se normaliza SOLO dentro de la persona,
   para que todo el rango de relieve sea suyo y no del fondo. */
const DW = 300;
const DH = Math.round(DW * (box.height / box.width));
const small = (buf, ch) =>
  (ch === 1 ? gray(buf) : sharp(buf, { raw: { width: W, height: H, channels: ch } }))
    .extract(box).resize(DW, DH, { kernel: 'lanczos3' }).raw().toBuffer();

const [sRGB, sA, sD] = await Promise.all([small(rgb, 3), small(alpha, 1), small(depthBuf, 1)]);

let dMin = 255, dMax = 0;
const lums = [];
for (let i = 0; i < DW * DH; i++) {
  if (sA[i] > 128) {
    if (sD[i] < dMin) dMin = sD[i];
    if (sD[i] > dMax) dMax = sD[i];
    lums.push(0.2126 * sRGB[i * 3] + 0.7152 * sRGB[i * 3 + 1] + 0.0722 * sRGB[i * 3 + 2]);
  }
}
/* La foto es oscura (luz magenta sobre fondo negro) y su luminancia vive en
   un rango corto. Se estira entre los percentiles 3 y 99 de la persona, para
   que en el retrato de glifos se lean los ojos y la sonrisa. */
lums.sort((a, b) => a - b);
const lLo = lums[Math.floor(lums.length * 0.03)] / 255;
const lHi = lums[Math.floor(lums.length * 0.99)] / 255;
console.log(`luminancia de la persona: p3 ${lLo.toFixed(2)} · p99 ${lHi.toFixed(2)}`);
/* Sin canal alfa a propósito: al leer una imagen con alfa en un canvas, el
   navegador premultiplica y los bordes pierden precisión. Tres canales y
   WebP con pérdida: para partículas, un error de 1/255 no se ve. */
const data = Buffer.alloc(DW * DH * 3);
for (let i = 0; i < DW * DH; i++) {
  // Fuera de la persona, todo a cero: comprime mucho mejor.
  if (sA[i] < 4) continue;
  const r = sRGB[i * 3] / 255, g = sRGB[i * 3 + 1] / 255, b = sRGB[i * 3 + 2] / 255;
  const lum = Math.min(1, Math.max(0, (0.2126 * r + 0.7152 * g + 0.0722 * b - lLo) / Math.max(0.05, lHi - lLo)));
  const d = (sD[i] - dMin) / Math.max(1, dMax - dMin);
  data[i * 3] = Math.round(lum * 255);
  data[i * 3 + 1] = Math.round(Math.min(1, Math.max(0, d)) * 255);
  data[i * 3 + 2] = sA[i];
}
await sharp(data, { raw: { width: DW, height: DH, channels: 3 } }).webp({ quality: 90, smartSubsample: false }).toFile(resolve(OUT, 'datos.webp'));

/* Los tres mapas por separado, para el colofón (Fig. 9). */
const canal = (c, nombre) => {
  const b = Buffer.alloc(DW * DH);
  for (let i = 0; i < DW * DH; i++) b[i] = data[i * 3 + c];
  return sharp(b, { raw: { width: DW, height: DH, channels: 1 } }).toColourspace('b-w').webp({ quality: 82 }).toFile(resolve(OUT, `canal-${nombre}.webp`));
};
await Promise.all([canal(0, 'luz'), canal(1, 'profundidad'), canal(2, 'mascara')]);

await writeFile(
  resolve(OUT, 'datos.json'),
  JSON.stringify({ width: DW, height: DH, aspect: box.width / box.height, fuente: 'tools/retrato.mjs' }, null, 2) + '\n',
);
console.log(`listo: public/retrato/retrato.webp · datos.webp (${DW}×${DH})`);
