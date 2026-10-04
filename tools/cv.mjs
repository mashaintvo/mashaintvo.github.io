/**
 * La hoja de vida en PDF (español e inglés) y las tarjetas para redes.
 *
 *   npm run cv
 *
 * Levanta Vite en local, abre Chromium con Playwright y:
 *   · imprime cv.html?lang=es|en a public/cv/ (A4, con las tipografías del sitio)
 *   · fotografía og.html?lang=en|es a public/og/ (1200 × 630)
 * Todo sale de src/datos: si cambia la trayectoria, se vuelve a correr esto.
 */
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await mkdir(resolve(root, 'public/cv'), { recursive: true });
await mkdir(resolve(root, 'public/og'), { recursive: true });

const server = await createServer({ root, logLevel: 'warn', server: { port: 5191, strictPort: false } });
await server.listen();
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  for (const [lang, archivo] of [['es', 'maria-sanjuan-hoja-de-vida.pdf'], ['en', 'maria-sanjuan-resume.pdf']]) {
    await page.goto(`${base}cv.html?lang=${lang}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const ruta = resolve(root, 'public/cv', archivo);
    await page.pdf({ path: ruta, format: 'A4', printBackground: true, preferCSSPageSize: true });
    const paginas = ((await readFile(ruta, 'latin1')).match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    console.log(`cv ${lang}: public/cv/${archivo} · ${paginas} página(s)`);
  }

  const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const lang of ['en', 'es']) {
    await og.goto(`${base}og.html?lang=${lang}`, { waitUntil: 'networkidle' });
    await og.waitForSelector('body[data-listo="1"]', { timeout: 20000 });
    await og.screenshot({ path: resolve(root, `public/og/maria-sanjuan-${lang}.jpg`), type: 'jpeg', quality: 88 });
    console.log(`og ${lang}: public/og/maria-sanjuan-${lang}.jpg`);
  }
} finally {
  await browser.close();
  await server.close();
}
