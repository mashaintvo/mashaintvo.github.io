import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'node:path';
import { renderBody, renderHead } from './src/plantilla';
import { renderCV } from './src/cv/plantilla';

/**
 * La 404, en un solo idioma: inglés por defecto (como el sitio) y español si
 * la visita venía de /es/ (lo decide src/no-encontrada.ts). Nunca los dos juntos.
 */
const render404 = () => `
  <main class="perdida" data-idioma="en" lang="en">
    <p class="perdida__marca" aria-hidden="true"><b>maría</b> <span class="grad">sanjuán</span></p>
    <p class="perdida__n">404</p>
    <h1>This page <em>doesn’t exist.</em></h1>
    <p>Maybe it moved.</p>
    <p class="perdida__enlaces"><a class="enlace" href="/">Go to the portfolio</a></p>
  </main>
  <main class="perdida" data-idioma="es" lang="es-CO" hidden>
    <p class="perdida__marca" aria-hidden="true"><b>maría</b> <span class="grad">sanjuán</span></p>
    <p class="perdida__n">404</p>
    <h1>Esta página <em>no existe.</em></h1>
    <p>Quizá cambió de dirección.</p>
    <p class="perdida__enlaces"><a class="enlace" href="/es/">Ir al portafolio</a></p>
  </main>`;

const page = (p: string) => resolve(__dirname, p);

/**
 * Vuelca el contenido en cada página. index.html y es/index.html son solo el
 * esqueleto; el sitio se escribe una vez en src/plantilla, con los dos idiomas
 * lado a lado. Vite reinicia el servidor cuando cambia la plantilla, porque es
 * una dependencia de este archivo.
 */
const paginas: Plugin = {
  name: 'paginas',
  transformIndexHtml: {
    order: 'pre',
    handler(html, ctx) {
      // cv.html (solo en desarrollo: tools/cv.mjs la imprime a PDF). ?lang=en | es
      if (html.includes('<!--cv-->')) {
        const en = new URL(ctx.originalUrl ?? ctx.path, 'http://x').searchParams.get('lang') === 'en';
        return html.replace('<!--cv-->', renderCV(en ? 'en' : 'es')).replace('<html lang="es">', `<html lang="${en ? 'en' : 'es-CO'}">`);
      }
      if (html.includes('<!--404-->')) return html.replace('<!--404-->', render404());
      if (!html.includes('<!--app-->')) return html;
      const lang = ctx.path.startsWith('/es/') ? 'es' : 'en';
      return html.replace('<!--head-->', renderHead(lang)).replace('<!--app-->', renderBody(lang));
    },
  },
};

/** Una sección a medio hacer no se publica (mismo seguro que luminahub-web). */
const sinPendientes: Plugin = {
  name: 'sin-pendientes',
  apply: 'build',
  transformIndexHtml(html, ctx) {
    if (html.includes('data-pendiente') && !process.env.PERMITIR_PENDIENTES) {
      throw new Error(`${ctx.filename}: tiene secciones pendientes. Un portafolio a medias no se publica.`);
    }
  },
};

export default defineConfig({
  base: '/',
  plugins: [paginas, sinPendientes],
  // El optimizador de dependencias del modo desarrollo no hereda `build.target`
  // y usa su propio objetivo (chrome87, safari14…). Con esbuild 0.28 eso tumba
  // `npm run dev` al arrancar en three y lenis (trampa conocida de
  // luminahub-web). Mismo objetivo en los dos modos.
  optimizeDeps: {
    esbuildOptions: { target: 'es2022' },
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    // three.js va solo en su paquete (≈140 kB gzip) y se descarga después del
    // texto: el aviso de 500 kB no aplica a ese caso.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        en: page('index.html'),
        es: page('es/index.html'),
        noEncontrada: page('404.html'),
      },
    },
  },
  server: { port: 5173, strictPort: false },
});
