/**
 * El ícono del sitio (pestaña, inicio del celular): «ms» en Manrope ExtraBold
 * con el degradado de los cuatro pasteles, sobre la baldosa berenjena.
 * Las letras van como trazos (no como texto), así el SVG no depende de que la
 * fuente esté instalada.
 *
 *   npm run icono   → public/favicon.svg, favicon-32.png, apple-touch-icon.png, icono-512.png
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as fontkit from 'fontkit';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fuente = fontkit.create(await readFile(resolve(root, 'node_modules/@fontsource/manrope/files/manrope-latin-800-normal.woff2')));

const LADO = 512;
const TRACKING = -60; // en unidades de la fuente (2000 por em): las dos letras más juntas
const ANCHO_TINTA = 0.8; // fracción del lado que ocupan las letras
const r = (n) => Math.round(n * 100) / 100;

// Las dos letras, una tras otra, en unidades de la fuente (y hacia arriba).
const run = fuente.layout('ms');
let x = 0;
const piezas = run.glyphs.map((g, i) => {
  const p = { path: g.path, x, bbox: g.path.bbox };
  x += run.positions[i].xAdvance + TRACKING;
  return p;
});
const minX = Math.min(...piezas.map((p) => p.x + p.bbox.minX));
const maxX = Math.max(...piezas.map((p) => p.x + p.bbox.maxX));
const minY = Math.min(...piezas.map((p) => p.bbox.minY));
const maxY = Math.max(...piezas.map((p) => p.bbox.maxY));
const escala = (LADO * ANCHO_TINTA) / (maxX - minX);
// Centro de la tinta al centro de la baldosa (y se invierte: en SVG crece hacia abajo).
const tx = LADO / 2 - ((minX + maxX) / 2) * escala;
const ty = LADO / 2 + ((minY + maxY) / 2) * escala;

// Las letras ya en medidas de la baldosa: así el degradado se mide sobre la baldosa entera.
const trazos = piezas.map((p) => p.path
  .scale(escala, -escala)
  .translate(tx + p.x * escala, ty)
  .toSVG()
  .replace(/-?\d+\.\d+/g, (n) => String(r(Number(n)))));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LADO} ${LADO}" width="${LADO}" height="${LADO}">
  <defs>
    <linearGradient id="ms" gradientUnits="userSpaceOnUse" x1="${r(tx + minX * escala)}" y1="0" x2="${r(tx + maxX * escala)}" y2="0">
      <stop offset="0" stop-color="#F3B0C3"/>
      <stop offset="0.4" stop-color="#8EE3D3"/>
      <stop offset="0.7" stop-color="#B8A9E8"/>
      <stop offset="1" stop-color="#FDF0A6"/>
    </linearGradient>
  </defs>
  <rect width="${LADO}" height="${LADO}" rx="${r(LADO * 0.22)}" fill="#0F0A14"/>
  <g fill="url(#ms)">
    ${trazos.map((d) => `<path d="${d}"/>`).join('\n    ')}
  </g>
</svg>`;

await writeFile(resolve(root, 'public/favicon.svg'), svg);
for (const [lado, nombre] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png'], [512, 'icono-512.png']]) {
  await sharp(Buffer.from(svg)).resize(lado, lado).png({ compressionLevel: 9 }).toFile(resolve(root, 'public', nombre));
}
console.log(`favicon.svg ${(svg.length / 1024).toFixed(1)} KB · favicon-32.png · apple-touch-icon.png · icono-512.png`);
