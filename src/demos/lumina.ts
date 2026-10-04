/**
 * Las cuatro figuras del caso Lúmina Tech. Se cargan cuando el caso se acerca
 * a la pantalla, con las tipografías de la marca de Lúmina (solo aquí).
 */
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import { K_LUMINA, POSICION_K, guionConsola, type EstadoK } from '../datos/lumina';
import { formatoRatio } from '../datos/contraste';

type Lang = 'en' | 'es';
interface Opciones { reduced: boolean; lite: boolean; lang: Lang }

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(s));
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Avisa cuando un elemento entra o sale de pantalla. */
function alVer(el: Element, cb: (visible: boolean) => void, margin = '0px') {
  new IntersectionObserver((entries) => entries.forEach((e) => cb(e.isIntersecting)), { rootMargin: margin }).observe(el);
}

/* ───────── el motor de partículas ───────── */

async function motor(el: HTMLElement, o: Opciones) {
  const canvas = $<HTMLCanvasElement>('canvas', el);
  if (!canvas) return;
  const [{ Mundo, hasWebGL }, formas, { estadoInicial }] = await Promise.all([import('../gl/mundo'), import('../gl/formas'), import('../gl/estado')]);
  if (!hasWebGL()) return;
  const n = o.lite ? 9000 : 16000;
  const S = { ...estadoInicial(), pM: 0, pL: 1, pC: 0, y: 0.08, scale: 1.05, empuje: 1 };
  const m = new Mundo({
    canvas, state: S, n,
    formas: [formas.simbolo(n), formas.red(n), formas.onda(n), formas.helice(n), formas.nudo(n)],
    fila: 0.0075, deFrente: [0], marco: el, modo: 1, materialFijo: true, estiloLumina: true,
    lite: o.lite, reducedMotion: o.reduced,
  });
  m.start();
  el.classList.add('es-vivo');
  let entro = false;
  alVer(el, (v) => {
    m.setVisible(v);
    if (v && !entro) { entro = true; void m.intro(2.2); }
  }, '100px');
  const botones = $$<HTMLButtonElement>('[data-forma]', el);
  botones.forEach((b) => b.addEventListener('click', () => {
    m.setForma(Number(b.dataset.forma));
    botones.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));
}

/* ───────── la consola del plan del día ───────── */

function consola(el: HTMLElement, o: Opciones) {
  const cuerpo = $('[data-consola]', el);
  const otra = $<HTMLButtonElement>('[data-consola-otra]', el);
  if (!cuerpo) return;
  const caret = document.createElement('span');
  caret.className = 'caret';
  let corriendo = false;

  const escribir = async () => {
    if (corriendo) return;
    corriendo = true;
    if (otra) otra.hidden = true;
    cuerpo.textContent = '';
    cuerpo.append(caret);
    for (const s of guionConsola(o.lang)) {
      const span = document.createElement('span');
      if (s.c) span.className = s.c;
      cuerpo.insertBefore(span, caret);
      if (o.reduced || !s.speed) span.textContent = s.t;
      else for (const ch of s.t) { span.textContent += ch; await wait(s.speed); }
      if (s.pause && !o.reduced) await wait(s.pause);
    }
    corriendo = false;
    if (otra) otra.hidden = false;
  };
  let empezo = false;
  alVer(el, (v) => { if (v && !empezo) { empezo = true; void escribir(); } }, '-20% 0px');
  otra?.addEventListener('click', () => void escribir());
}

/* ───────── el sistema de marca ───────── */

function marca(el: HTMLElement, o: Opciones) {
  const muestra = $('[data-marca-muestra]', el);
  const veredicto = $('[data-marca-veredicto]', el);
  const t = (en: string, es: string) => (o.lang === 'es' ? es : en);
  $$<HTMLInputElement>('input[name="marca-color"]', el).forEach((r) => r.addEventListener('change', () => {
    if (!r.checked || !muestra || !veredicto) return;
    muestra.style.color = r.value;
    const ratio = Number(r.dataset.ratio);
    const ok = ratio >= 4.5;
    veredicto.textContent = `${formatoRatio(ratio, o.lang)} · ${ok
      ? t('passes AA for small text (4.5:1)', 'cumple AA para texto pequeño (4,5:1)')
      : t('fails AA for small text (needs 4.5:1)', 'no cumple AA para texto pequeño (pide 4,5:1)')}`;
    veredicto.style.color = ok ? '#4DFF4B' : '#FF8A8A';
  }));
}

/* ───────── la coreografía del scroll ───────── */

const CLAVES: (keyof EstadoK)[] = ['morph', 'x', 'y', 'scale', 'alpha', 'spin'];
const NOMBRE_MORPH = { es: ['logo', 'red neuronal', 'onda', 'hélice', 'nudo', 'logo'], en: ['logo', 'neural network', 'wave', 'helix', 'knot', 'logo'] };

function estadoEn(p: number): { k: EstadoK; i: number } {
  let i = 0;
  while (i < POSICION_K.length - 2 && p >= POSICION_K[i + 1]) i++;
  const a = POSICION_K[i], b = POSICION_K[i + 1];
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  const A = K_LUMINA[i].k, B = K_LUMINA[i + 1].k;
  const k = {} as EstadoK;
  for (const c of CLAVES) k[c] = A[c] + (B[c] - A[c]) * t;
  return { k, i: t > 0.02 ? i + 1 : i };
}

function coreografia(el: HTMLElement, o: Opciones) {
  const rango = $<HTMLInputElement>('[data-coreo-rango]', el);
  const pct = $('[data-coreo-pct]', el);
  const seccion = $('[data-coreo-seccion]', el);
  const codigo = $('[data-coreo-codigo]', el);
  const figura = $('[data-coreo-figura]', el);
  const retraso = $<HTMLInputElement>('[data-coreo-retraso]', el);
  const saltar = $<HTMLButtonElement>('[data-coreo-saltar]', el);
  const resultado = $('[data-coreo-resultado]', el);
  if (!rango || !figura) return;
  const t = (en: string, es: string) => (o.lang === 'es' ? es : en);

  const pintar = (k: EstadoK, i: number) => {
    for (const c of CLAVES) {
      const dd = $(`[data-k="${c}"]`, el);
      if (dd) dd.textContent = k[c].toFixed(2);
    }
    figura.style.setProperty('--fx', String(k.x));
    figura.style.setProperty('--fy', String(k.y));
    figura.style.setProperty('--fs', String(0.55 + k.scale * 0.45));
    figura.style.setProperty('--fa', String(0.25 + k.alpha * 0.75));
    figura.style.setProperty('--fr', String(k.spin * 0.15));
    figura.dataset.forma = String(Math.round(k.morph) % 5);
    if (seccion) seccion.textContent = K_LUMINA[i].seccion[o.lang];
    if (codigo) codigo.textContent = K_LUMINA[i].codigo;
  };
  const actualizar = () => {
    const p = Number(rango.value) / 1000;
    if (pct) pct.textContent = `${Math.round(p * 100)} %`;
    const { k, i } = estadoEn(p);
    pintar(k, i);
  };
  rango.addEventListener('input', actualizar);
  actualizar();

  /* El error que pasó: con scrub: 1, el timeline de productos seguía
     escribiendo la escena después de que el contacto pusiera la suya. */
  saltar?.addEventListener('click', async () => {
    const desde = Number(rango.value) / 1000;
    const iContacto = K_LUMINA.length - 1;
    rango.value = String(Math.round(POSICION_K[iContacto] * 1000));
    if (pct) pct.textContent = `${Math.round(POSICION_K[iContacto] * 100)} %`;
    pintar(K_LUMINA[iContacto].k, iContacto);
    const iHub = K_LUMINA.findIndex((k) => k.id === 'hub');
    const conRetraso = retraso?.checked && desde < POSICION_K[iHub];
    if (!conRetraso) {
      if (resultado) resultado.innerHTML = `<span class="es-ok">morph 5 · ${NOMBRE_MORPH[o.lang][5]} ✓</span><br>${retraso?.checked
        ? t('From here the products timeline had already finished, so nothing late arrives. Try jumping from before Hub.', 'Desde aquí el timeline de productos ya había terminado, así que no llega nada tarde. Prueba a saltar desde antes de Hub.')
        : t('scrub: true writes immediately: the contact state wins.', 'scrub: true escribe al instante: gana el estado del contacto.')}`;
      return;
    }
    // El timeline de productos alcanza su final durante 1 s y escribe encima.
    const desdeK = estadoEn(Math.max(desde, POSICION_K[K_LUMINA.findIndex((k) => k.id === 'campus') - 1])).k;
    const finK = K_LUMINA[iHub].k;
    const inicio = performance.now();
    if (resultado) resultado.textContent = t('…the delayed timeline is still writing…', '…el timeline con retraso sigue escribiendo…');
    await new Promise<void>((resolve) => {
      const paso = () => {
        const f = Math.min(1, (performance.now() - inicio) / (o.reduced ? 1 : 1000));
        const k = {} as EstadoK;
        for (const c of CLAVES) k[c] = desdeK[c] + (finK[c] - desdeK[c]) * (1 - Math.pow(1 - f, 3));
        pintar(k, iContacto);
        if (f < 1) requestAnimationFrame(paso); else resolve();
      };
      paso();
    });
    if (resultado) resultado.innerHTML = `<span class="es-no">morph 4 · ${NOMBRE_MORPH[o.lang][4]} ✕</span><br>${t(
      'Stuck on the knot: the delayed timeline wrote after the contact set its state. Hence scrub: true everywhere the scene is written.',
      'Se quedó en el nudo: el timeline con retraso escribió después de que el contacto pusiera su estado. Por eso, scrub: true en todo lo que escribe la escena.',
    )}`;
  });
}

export function iniciarLumina(o: Opciones) {
  const raiz = $('#lumina-tech');
  if (!raiz) return;
  const m = $('[data-demo="motor"]', raiz);
  if (m) void motor(m, o);
  const c = $('[data-demo="consola"]', raiz);
  if (c) consola(c, o);
  const b = $('[data-demo="marca"]', raiz);
  if (b) marca(b, o);
  const k = $('[data-demo="coreo"]', raiz);
  if (k) coreografia(k, o);
}
