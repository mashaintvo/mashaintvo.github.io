/**
 * La tarjeta para redes: el nombre y el retrato en código, dibujado en un
 * canvas 2D con el mismo mapa de datos y el mismo programa que la portada
 * (sin WebGL, para que la captura sea siempre igual).
 */
import '@fontsource-variable/manrope';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './og.css';
import { CODIGO_RETRATO, CODIGO_RETRATO_ES } from '../datos/perfil';
import { cargarRetrato, muestra } from '../gl/retrato';

const lang = new URLSearchParams(location.search).get('lang') === 'es' ? 'es' : 'en';
document.documentElement.lang = lang;
document.querySelectorAll<HTMLElement>('[data-en]').forEach((el) => { el.textContent = el.dataset[lang] ?? ''; });

const mezcla = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t))));
const LILA = [184, 169, 232], AQUA = [142, 227, 211], MANT = [253, 240, 166];

async function dibujar() {
  await document.fonts.load('600 12px "Geist Mono Variable"');
  await document.fonts.ready;
  const r = await cargarRetrato();
  const canvas = document.querySelector<HTMLCanvasElement>('.og__retrato')!;
  const ctx = canvas.getContext('2d')!;
  const H = 620, W = H * (r.w / r.h);
  const x0 = canvas.width - W - 10, y0 = canvas.height - H + 20;
  const filas = 104;
  const fila = H / filas, col = fila * 0.6;
  const cols = Math.floor(W / col);
  const flujo = (lang === 'es' ? CODIGO_RETRATO_ES : CODIGO_RETRATO).replace(/\s+/g, ' ');
  ctx.font = `700 ${fila * 0.92}px "Geist Mono Variable", monospace`;
  ctx.textBaseline = 'top';
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < cols; c++) {
      const ch = flujo[(f * cols + c + f * 17) % flujo.length];
      if (ch === ' ') continue;
      const s = muestra(r, (c + 0.5) / cols, (f + 0.5) / filas);
      if (s.mask < 0.3) continue;
      const l = s.lum;
      const rgb = l < 0.42 ? mezcla(LILA.map((v) => v * 0.7), AQUA, (l - 0.02) / 0.4) : mezcla(AQUA, MANT, (l - 0.42) / 0.45);
      ctx.fillStyle = `rgba(${rgb.join(',')},${(0.3 + 0.7 * Math.pow(l, 0.75)) * Math.min(1, s.mask * 1.4)})`;
      ctx.fillText(ch, x0 + c * col, y0 + f * fila);
    }
  }
  document.body.dataset.listo = '1';
}
void dibujar();
