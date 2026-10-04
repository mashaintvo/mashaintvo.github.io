/**
 * Auditoría de accesibilidad y de maquetación sobre el build de producción.
 *
 *   npm run build && npm run auditoria
 *
 * El mismo criterio que la de Lúmina Campus: axe con WCAG 2.0/2.1 A y AA, falla
 * con impacto grave o crítico; además, desborde horizontal a 390 y 320 px.
 * Recorre las dos versiones (en, es) en escritorio y en móvil, con las demos
 * cargadas (baja hasta cada caso) y también con movimiento reducido.
 */
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AXE = require.resolve('axe-core/axe.min.js');
const GRAVES = ['serious', 'critical'];

const server = await preview({ root, preview: { port: 4191, strictPort: false }, logLevel: 'warn' });
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch();
const hallazgos = [];
let revisiones = 0;

const pantallas = [
  { nombre: 'escritorio', width: 1440, height: 900 },
  { nombre: 'móvil', width: 390, height: 844 },
  { nombre: 'móvil estrecho', width: 320, height: 640 },
];

try {
  for (const ruta of ['/', '/es/']) {
    for (const p of pantallas) {
      for (const reducido of [false, true]) {
        if (reducido && p.nombre !== 'móvil') continue;
        const ctx = await browser.newContext({ viewport: { width: p.width, height: p.height }, reducedMotion: reducido ? 'reduce' : 'no-preference' });
        const page = await ctx.newPage();
        const errores = [];
        page.on('pageerror', (e) => errores.push(e.message));
        const etiqueta = `${ruta} · ${p.nombre}${reducido ? ' · movimiento reducido' : ''}`;
        await page.goto(base.replace(/\/$/, '') + ruta, { waitUntil: 'networkidle' });
        // Baja por la página para que carguen las demos (se cargan al acercarse).
        await page.evaluate(async () => {
          for (const id of ['#lumina-tech', '#lumina-campus', '#indice', '#contacto']) {
            document.querySelector(id)?.scrollIntoView();
            await new Promise((r) => setTimeout(r, 900));
          }
          window.scrollTo(0, 0);
          await new Promise((r) => setTimeout(r, 400));
        });
        await page.addScriptTag({ path: AXE });
        const r = await page.evaluate(async () => {
          // eslint-disable-next-line no-undef
          const res = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
          return res.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodos: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
        });
        revisiones++;
        for (const v of r.filter((v) => GRAVES.includes(v.impact))) hallazgos.push({ pantalla: etiqueta, tipo: 'axe', detalle: `${v.id} (${v.impact}): ${v.help} · ${v.nodos.join(' | ')}` });
        const menores = r.filter((v) => !GRAVES.includes(v.impact));
        if (menores.length) console.log(`  aviso ${etiqueta}: ${menores.map((v) => `${v.id} (${v.impact})`).join(', ')}`);

        const desborde = await page.evaluate(() => {
          const w = document.documentElement.clientWidth;
          const anchos = [];
          for (const el of document.querySelectorAll('body *')) {
            const rct = el.getBoundingClientRect();
            if (rct.right > w + 1 && getComputedStyle(el).position !== 'fixed') {
              // Lo que recorta su propio contenedor (overflow) no desborda la página.
              let p = el.parentElement, recortado = false;
              while (p && p !== document.body) {
                const cs = getComputedStyle(p);
                if (cs.overflowX !== 'visible' && p.getBoundingClientRect().right <= w + 1) { recortado = true; break; }
                p = p.parentElement;
              }
              if (!recortado) anchos.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} → ${Math.round(rct.right)}px`);
            }
            if (anchos.length > 4) break;
          }
          return { scroll: document.documentElement.scrollWidth, w, anchos };
        });
        if (desborde.scroll > desborde.w + 1 || desborde.anchos.length) {
          hallazgos.push({ pantalla: etiqueta, tipo: 'desborde', detalle: `scrollWidth ${desborde.scroll} > ${desborde.w} · ${desborde.anchos.join(' · ')}` });
        }
        if (errores.length) hallazgos.push({ pantalla: etiqueta, tipo: 'error JS', detalle: errores.join(' | ') });
        await ctx.close();
      }
    }
  }
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}

console.log(`\n${revisiones} revisiones · ${hallazgos.length} hallazgos`);
for (const h of hallazgos) console.log(`  [${h.tipo}] ${h.pantalla}\n      ${h.detalle}`);
process.exitCode = hallazgos.length ? 1 : 0;
