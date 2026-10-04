import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource-variable/manrope';
import './estilos/base.css';
import './estilos/nav.css';
import './estilos/portada.css';
import './estilos/carta.css';
import './estilos/pie.css';
import './estilos/trabajo.css';
import './estilos/secciones.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import type { Mundo } from './gl/mundo';
import { estadoInicial } from './gl/estado';
import { CODIGO_RETRATO, CODIGO_RETRATO_ES } from './datos/perfil';
import { letrasDobles, splitWords } from './ui/split';
import { iniciarCursor } from './ui/cursor';
import { iniciarMovimiento, iniciarPestanas, iniciarVisor } from './ui/movimiento';

gsap.registerPlugin(ScrollTrigger);

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(s));

const html = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const lite = matchMedia('(max-width: 760px), (pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;
if (reduced) html.classList.add('reducido');
const lang = html.lang.startsWith('es') ? 'es' : 'en';

/* ───────── scroll suave ───────── */

let lenis: Lenis | undefined;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* La escena llega después (ver «WebGL» más abajo); hasta entonces, null. */
let mundo: Mundo | null = null;

/* ───────── los dos roles ───────── */

type Modo = 'codigo' | 'diseno';
let modo: Modo = html.dataset.modo === 'diseno' ? 'diseno' : 'codigo';
const lupa = $('[data-lupa]');
const lupaLabel = $('[data-lupa-label]');
iniciarCursor({ reducido: reduced, lupa });

function aplicarModo(m: Modo, guardar = true) {
  modo = m;
  html.dataset.modo = m;
  $$('[data-modo-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modoBtn === m)));
  if (lupaLabel) lupaLabel.textContent = m === 'codigo' ? lupaLabel.dataset.c! : lupaLabel.dataset.d!;
  mundo?.setModo(m === 'diseno' ? 1 : 0);
  if (guardar) { try { localStorage.setItem('ms:modo', m); } catch { /* sin almacenamiento: solo esta visita */ } }
}
$$('[data-modo-btn]').forEach((b) => b.addEventListener('click', () => aplicarModo(b.dataset.modoBtn as Modo)));
aplicarModo(modo, false);

/* ───────── WebGL ─────────
   three.js va en su propio paquete y se descarga en paralelo: el texto no lo
   espera. La coreografía escribe en S desde ya; la escena, cuando llega, lo
   lee. Sin WebGL, S es un objeto inerte y la portada muestra la foto. */

const S = estadoInicial();
const canvas = $<HTMLCanvasElement>('.webgl');
const figura = $('[data-retrato]');

async function crearMundo(): Promise<Mundo | null> {
  if (!canvas) return null;
  try {
    const [{ Mundo, hasWebGL }, { cargarRetrato }, formas] = await Promise.all([
      import('./gl/mundo'), import('./gl/retrato'), import('./gl/formas'),
    ]);
    if (!hasWebGL()) return null;
    // El atlas de glifos se dibuja con la monoespaciada: hay que esperarla.
    await Promise.race([document.fonts.load('600 48px "Geist Mono Variable"'), new Promise((r) => setTimeout(r, 1500))]);
    const retrato = await cargarRetrato();
    const rej = formas.rejillaRetrato(retrato, lite ? 88 : 124, lang === 'es' ? CODIGO_RETRATO_ES : CODIGO_RETRATO);
    const n = rej.n;
    // El colofón dice cuántos glifos hay: los de esta pantalla, contados aquí.
    $$('[data-glifos]').forEach((el) => {
      el.textContent = lang === 'es' ? `${n.toLocaleString('es-CO')} glifos en esta pantalla` : `${n.toLocaleString('en-US')} glyphs on this screen`;
    });
    const w = new Mundo({
      canvas, state: S, n,
      formas: [rej.forma, formas.campo(n)],
      glifo: rej.glifo, caracteres: rej.caracteres, color: rej.color, fila: rej.fila,
      deFrente: [0], introEnSitio: true,
      tamFigura0: { w: 6.4 * (retrato.w / retrato.h), h: 6.4 },
      modo: modo === 'diseno' ? 1 : 0,
      lite, reducedMotion: reduced,
      onLente: (x, y, visible) => {
        if (!lupa) return;
        lupa.style.setProperty('--lx', `${x}px`);
        lupa.style.setProperty('--ly', `${y}px`);
        lupa.classList.toggle('es-visible', visible);
      },
    });
    w.start();
    return w;
  } catch (err) {
    console.warn('[maria] Sin partículas: WebGL no disponible o no cargó', err);
    return null;
  }
}

/** Pone la foto exactamente donde están las partículas del retrato. */
function alinearPoster() {
  const r = mundo?.rectFigura0();
  if (!r || !figura) return;
  figura.style.setProperty('--px', `${r.x}px`);
  figura.style.setProperty('--py', `${r.y}px`);
  figura.style.setProperty('--pw', `${r.w}px`);
  figura.style.setProperty('--ph', `${r.h}px`);
}

/* ───────── entradas ───────── */

const lineasPortada = $$('.portada__nombre .linea > span');
const entra = $$('[data-entra]');
const nav = $('[data-nav]')!;

$$('.nav__menu a').forEach(letrasDobles);

if (!reduced) {
  gsap.set(lineasPortada, { yPercent: 110 });
  gsap.set(entra, { y: 20, opacity: 0 });
  gsap.set(nav, { yPercent: -100, opacity: 0 });

  $$('[data-lineas]').forEach((el) => {
    const words = splitWords(el);
    gsap.from(words, { yPercent: 110, duration: 1.2, stagger: 0.04, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  degradadoContinuo();
  void document.fonts?.ready.then(degradadoContinuo);
  addEventListener('resize', degradadoContinuo, { passive: true });
}

/**
 * El acento de los titulares es un solo degradado aunque cada palabra viva en
 * su propia ventana: a cada palabra se le dice qué tramo del degradado le toca
 * (las palabras solo se mueven en vertical, así que el tramo no cambia al entrar).
 */
function degradadoContinuo() {
  $$('h1 em, h2 em, h3 em, .grad').forEach((em) => {
    const palabras = $$('.w__i', em);
    if (!palabras.length) return;
    const caja = em.getBoundingClientRect();
    palabras.forEach((p) => {
      p.style.setProperty('--gw', `${caja.width}px`);
      p.style.setProperty('--gx', `${caja.left - p.getBoundingClientRect().left}px`);
    });
  });
}

if (!reduced) {
  gsap.set('[data-revela]', { y: 40, opacity: 0 });
  ScrollTrigger.batch('[data-revela]', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: 'expo.out', overwrite: true }),
  });
}

/* ───────── el contenido también se mueve (antes de la coreografía: sus fijados corren lo que viene después) ───────── */

iniciarPestanas({ reducido: reduced });
iniciarVisor();
iniciarMovimiento({ reducido: reduced });

/* ───────── barra: se esconde al bajar, vuelve al subir ───────── */

let navOculta = false;
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => {
    const y = self.scroll();
    nav.classList.toggle('es-solida', y > 40);
    const ocultar = self.direction === 1 && y > 500 && !html.classList.contains('menu-abierto');
    if (ocultar !== navOculta) {
      navOculta = ocultar;
      gsap.to(nav, { yPercent: ocultar ? -100 : 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    }
  },
});
lenis?.on('scroll', ({ velocity }: Lenis) => mundo?.setVelocity(velocity));

/* El encabezado corrido: la sección en la que estás, como en una revista. */
const corrida = $('[data-corrida]');
const corridaN = $('[data-corrida-n]');
const secciones = $$('[data-seccion]');
secciones.forEach((sec, i) => {
  ScrollTrigger.create({
    trigger: sec,
    start: 'top 45%',
    end: 'bottom 45%',
    onToggle: (self) => {
      if (!self.isActive) return;
      if (corrida) corrida.textContent = sec.dataset.seccion ?? '';
      if (corridaN) corridaN.textContent = String(i).padStart(2, '0');
      $$('.nav__menu a').forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === `#${sec.id}`)));
    },
  });
});

/* ───────── coreografía del retrato ─────────
   Portada: el retrato. Al bajar, se deshace en líneas de código que flotan
   detrás del contenido. En el contacto se vuelve a juntar: una firma.
   x / y son fracciones de la pantalla visible (ver EstadoMundo). Siempre
   fromTo con valores explícitos: saltar con un ancla deja la escena donde debe. */

const mm = gsap.matchMedia();
mm.add({ ancho: '(min-width: 761px)', estrecho: '(max-width: 760px)' }, (ctx) => {
  const ancho = Boolean(ctx.conditions?.ancho);
  const base = { spin: 0, pM: 1, pL: 0, pC: 0 };
  const K = {
    portada: { ...base, x: ancho ? 0.43 : 0, y: ancho ? -0.04 : 0.36, scale: ancho ? 1 : 0.62, alpha: 1, lente: 1, empuje: 0 },
    // el código de fondo, apenas: que acompañe sin ensuciar
    campo: { ...base, x: 0, y: -0.2, scale: 1, alpha: 0.28, lente: 0, empuje: 0.6 },
    campoFin: { ...base, x: 0, y: 0.5, scale: 1, alpha: 0.28, lente: 0, empuje: 0.6 },
    contacto: { ...base, x: ancho ? 0.45 : 0, y: ancho ? -0.05 : 0.3, scale: ancho ? 0.92 : 0.56, alpha: 1, lente: 1, empuje: 0 },
  };
  gsap.set(S, K.portada);
  alinearPoster();

  const seg = (trigger: string, start: string, end: string | (() => string), from: object, to: object) =>
    gsap.fromTo(S, { ...from }, { ...to, ease: 'none', immediateRender: false, scrollTrigger: { trigger, start, end, scrub: true } });

  seg('.portada', 'top top', 'bottom 20%', K.portada, K.campo);
  // El campo termina justo donde empieza el contacto (su borde superior entra por
  // abajo): si se pisaran, el campo volvía a escribir encima del retrato al final.
  seg('#sobre-mi', 'top 20%', () => `+=${Math.max(1, ($('#contacto')?.offsetTop ?? 0) - ($('#sobre-mi')?.offsetTop ?? 0) - innerHeight * 0.8)}`, K.campo, K.campoFin);
  seg('#contacto', 'top bottom', 'top 25%', K.campoFin, K.contacto);
});

// La figura cambia por tiempo, no por scroll: nunca queda a medias. Cuál toca
// se decide por la posición, no por eventos de cruce: quien llega con un ancla
// (/#trabajo) no cruza nada y aun así debe ver el campo.
function formaPorScroll() {
  if (!mundo) return;
  const y = window.scrollY, vh = window.innerHeight;
  const portada = $('.portada'), contacto = $('#contacto');
  const finPortada = portada ? portada.offsetTop + portada.offsetHeight * 0.08 : vh * 0.08;
  const inicioContacto = contacto ? contacto.offsetTop - vh * 0.55 : Infinity;
  mundo.setForma(y > finPortada && y < inicioContacto ? 1 : 0);
}
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: formaPorScroll, onRefresh: formaPorScroll });

/* ───────── índice: conocimientos × trayectoria ───────── */

(function initIndice() {
  const sec = $('#indice');
  if (!sec) return;
  const ks = $$<HTMLButtonElement>('button.indice__k', sec);
  const trabajos = $$('[data-trabajo]', sec);
  const btnTrabajo = $$<HTMLButtonElement>('.trabajo-item__btn', sec);
  const anuncio = $('[data-indice-anuncio]', sec);
  const k = (id: string) => $(`.indice__k[data-k="${id}"]`, sec);
  const nombre = (id: string) => k(id)?.textContent ?? id;
  const empresa = (t: HTMLElement) => $('.trabajo-item__empresa', t)?.textContent ?? '';
  /** Lo fijado con un clic. Pasar el ratón solo previsualiza, y nunca toca aria-pressed. */
  let fijo: HTMLButtonElement | null = null;

  const limpiar = () => {
    sec.classList.remove('es-filtrando');
    trabajos.forEach((t) => t.classList.remove('es-encendido', 'es-apagado'));
    $$('.indice__k', sec).forEach((k) => k.classList.remove('es-del-trabajo', 'es-elegido'));
  };
  const porConocimiento = (b: HTMLButtonElement) => {
    limpiar();
    sec.classList.add('es-filtrando');
    b.classList.add('es-elegido');
    const usan = trabajos.filter((t) => t.dataset.usa!.split(' ').includes(b.dataset.k!));
    trabajos.forEach((t) => t.classList.add(usan.includes(t) ? 'es-encendido' : 'es-apagado'));
    return `${nombre(b.dataset.k!)}: ${usan.map(empresa).join(', ')}`;
  };
  const porTrabajo = (b: HTMLButtonElement) => {
    limpiar();
    sec.classList.add('es-filtrando');
    const t = b.closest<HTMLElement>('[data-trabajo]')!;
    const usa = t.dataset.usa!.split(' ');
    trabajos.forEach((x) => x.classList.add(x === t ? 'es-encendido' : 'es-apagado'));
    usa.forEach((id) => k(id)?.classList.add('es-del-trabajo'));
    return `${empresa(t)}: ${usa.map(nombre).join(', ')}`;
  };
  const mostrar = (b: HTMLButtonElement) => (b.classList.contains('indice__k') ? porConocimiento(b) : porTrabajo(b));
  const fijar = (b: HTMLButtonElement | null) => {
    fijo?.setAttribute('aria-pressed', 'false');
    fijo = b;
    if (!b) { limpiar(); if (anuncio) anuncio.textContent = ''; return; }
    b.setAttribute('aria-pressed', 'true');
    const texto = mostrar(b);
    if (anuncio) anuncio.textContent = texto;
  };
  [...ks, ...btnTrabajo].forEach((b) => {
    b.addEventListener('click', () => fijar(fijo === b ? null : b));
    if (finePointer) {
      b.addEventListener('pointerenter', () => { if (!fijo) mostrar(b); });
      b.addEventListener('pointerleave', () => { if (!fijo) limpiar(); else mostrar(fijo); });
    }
  });
})();

/* ───────── el cierre: su nombre entra y se inclina hacia el cursor ───────── */

(function initPieMarca() {
  const img = $('[data-pie-marca]');
  if (!img || reduced) return;
  // Las dos palabras suben desde abajo, una tras otra.
  const partes = Array.from(img.children) as HTMLElement[];
  gsap.set(partes, { display: 'inline-block', yPercent: 60, opacity: 0 });
  ScrollTrigger.create({
    trigger: img, start: 'top 90%', once: true,
    onEnter: () => gsap.to(partes, { yPercent: 0, opacity: 1, duration: 1.3, stagger: 0.14, ease: 'expo.out' }),
  });
  if (!finePointer) return;
  gsap.set(img, { transformPerspective: 1100 });
  const rx = gsap.quickTo(img, 'rotationX', { duration: 1.1, ease: 'power3' });
  const ry = gsap.quickTo(img, 'rotationY', { duration: 1.1, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    const r = img.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    ry(((e.clientX - (r.left + r.width / 2)) / innerWidth) * 26);
    rx(-((e.clientY - (r.top + r.height / 2)) / innerHeight) * 18);
  }, { passive: true });
})();

/* ───────── contacto: el motivo reescribe los enlaces ───────── */

(function initContacto() {
  const sec = $('#contacto');
  if (!sec) return;
  const correo = $<HTMLAnchorElement>('[data-canal="correo"]', sec);
  const wa = $<HTMLAnchorElement>('[data-canal="whatsapp"]', sec);
  $$<HTMLInputElement>('input[name="motivo"]', sec).forEach((r) => r.addEventListener('change', () => {
    if (!r.checked) return;
    const asunto = r.dataset.asunto ?? '', mensaje = r.dataset.mensaje ?? '';
    if (correo) {
      const base = correo.href.split('?')[0];
      correo.href = `${base}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;
    }
    if (wa) {
      const base = wa.href.split('?')[0];
      wa.href = `${base}?text=${encodeURIComponent(mensaje)}`;
    }
  }));
  const copiar = $<HTMLButtonElement>('[data-copiar]', sec);
  copiar?.addEventListener('click', async () => {
    const original = copiar.textContent;
    try {
      await navigator.clipboard.writeText(copiar.dataset.copiar ?? '');
      copiar.textContent = copiar.dataset.copiado ?? 'OK';
    } catch {
      // Sin portapapeles: se selecciona el correo visible para copiarlo a mano.
      const v = $('[data-canal="correo"] .canal__v', sec);
      if (v) { const r = document.createRange(); r.selectNodeContents(v); getSelection()?.removeAllRanges(); getSelection()?.addRange(r); }
    }
    setTimeout(() => { copiar.textContent = original; }, 2200);
  });
})();

/* ───────── demos de los casos ─────────
   Cada caso trae sus demos (y las tipografías de su marca) solo cuando se
   acerca a la pantalla. El HTML ya tiene su versión estática. */

function cargarAlAcercarse(sel: string, cargar: () => Promise<unknown>) {
  const el = $(sel);
  if (!el) return;
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    cargar().catch((err) => console.warn(`[maria] ${sel}: la demo no cargó`, err));
  }, { rootMargin: '900px 0px' });
  io.observe(el);
}
cargarAlAcercarse('#lumina-tech', () => import('./demos/lumina').then((m) => m.iniciarLumina({ reduced, lite, lang })));
cargarAlAcercarse('#lumina-campus', () => import('./demos/campus').then((m) => m.iniciarCampus({ reduced, lang })));

/* ───────── carga y entrada ───────── */

const ENTRADA = 'ms:entrada';
const yaVioEntrada = (() => { try { return sessionStorage.getItem(ENTRADA) === '1'; } catch { return false; } })();
const marcarEntrada = () => { try { sessionStorage.setItem(ENTRADA, '1'); } catch { /* se repite, nada más */ } };

const mundoListo = crearMundo().then((w) => {
  mundo = w;
  if (!w) html.classList.add('no-webgl');
  else {
    html.classList.add('gl-listo');
    alinearPoster();
    formaPorScroll();
    addEventListener('resize', () => requestAnimationFrame(alinearPoster));
  }
  return w;
});

/** La foto se convierte en código: una línea de escaneo baja por ella. */
function escanear(w: Mundo, duracion: number) {
  if (!figura) return w.intro(duracion);
  const p = { v: 0 };
  gsap.to(p, {
    v: 1, duration: duracion, ease: 'none',
    onUpdate: () => {
      // La misma relación que usa el shader: la fila yn está escrita cuando
      // 1,35·v − yn ≥ 0,3. La foto se va justo ahí, ni antes ni después.
      const scan = Math.min(1.1, Math.max(-0.1, 1.35 * p.v - 0.3));
      figura.style.setProperty('--scan', `${(scan * 100).toFixed(2)}%`);
      figura.style.setProperty('--scanf', scan.toFixed(4));
      figura.style.setProperty('--scan-op', String(scan > 0 && scan < 1 ? 1 : 0));
    },
    onComplete: () => html.classList.add('gl-codigo'),
  });
  return w.intro(duracion);
}

async function boot() {
  const cargador = $('.cargador');
  const fuentes = (document.fonts?.ready ?? Promise.resolve()).catch(() => undefined);
  const fuentesOTiempo = Promise.race([fuentes, new Promise((r) => setTimeout(r, 900))]);

  if (reduced) {
    cargador?.remove();
    await Promise.all([fuentesOTiempo, mundoListo]);
    if (mundo) html.classList.add('gl-codigo');
    ScrollTrigger.refresh();
    return;
  }

  const entrar = () => gsap.timeline()
    .to(lineasPortada, { yPercent: 0, duration: 1.4, stagger: 0.1, ease: 'expo.out' }, 0)
    .to(entra, { y: 0, opacity: 1, duration: 1.1, stagger: 0.06, ease: 'expo.out' }, 0.25)
    .to(nav, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out' }, 0.3);

  if (!cargador || yaVioEntrada || location.hash.length > 1) {
    cargador?.remove();
    await fuentesOTiempo;
    ScrollTrigger.refresh();
    entrar();
    void mundoListo.then((w) => { if (w) void escanear(w, 1.6); });
    marcarEntrada();
    return;
  }

  // El cargador: su nombre sube letra a letra (diseño) mientras el cursor
  // escribe su rol debajo (código).
  const nombreEl = $('.cargador__nombre')!;
  const letras: HTMLElement[] = [];
  nombreEl.querySelectorAll('b, .grad').forEach((parte) => {
    const t = parte.textContent ?? '';
    parte.textContent = '';
    for (const ch of t) {
      const l = document.createElement('span');
      // .w__i: cada letra pinta su tramo del degradado (degradadoContinuo)
      l.className = 'cargador__letra w__i';
      l.textContent = ch;
      parte.append(l);
      letras.push(l);
    }
  });
  degradadoContinuo();
  const texto = $('[data-cargador-texto]')!;
  const rol = $('.cargador__linea')?.dataset.rol ?? '';
  const tipeo = { n: 0 };
  const tl = gsap.timeline();
  tl.fromTo(letras, { yPercent: 110, opacity: 0, rotate: 6 }, { yPercent: 0, opacity: 1, rotate: 0, duration: 1.2, stagger: 0.045, ease: 'expo.out' }, 0.1)
    .to(tipeo, { n: rol.length, duration: 1.1, ease: 'none', onUpdate: () => { texto.textContent = rol.slice(0, Math.round(tipeo.n)); } }, 0.55);

  await Promise.all([tl, fuentesOTiempo, Promise.race([mundoListo, new Promise((r) => setTimeout(r, 2200))])]);
  ScrollTrigger.refresh();
  alinearPoster();

  const salida = gsap.timeline();
  salida.to(cargador, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, 0)
    .add(entrar(), 0.45)
    .add(() => { if (mundo) void escanear(mundo, 2); }, 0.6);
  await salida;
  cargador.remove();
  document.body.classList.remove('cargando');
  marcarEntrada();
}

document.body.classList.add('cargando');
void boot().finally(() => document.body.classList.remove('cargando'));

/* ───────── menú móvil ───────── */

(function initMenu() {
  const toggle = $<HTMLButtonElement>('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (!toggle || !menu) return;
  const label = $('.nav__toggle-label', toggle)!;
  const abrir = () => {
    menu.hidden = false;
    html.classList.add('menu-abierto');
    toggle.setAttribute('aria-expanded', 'true');
    label.textContent = menu.dataset.cerrar ?? 'Cerrar';
    lenis?.stop();
    if (!reduced) {
      gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' });
      gsap.fromTo($$('li', menu), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.06, delay: 0.25, ease: 'expo.out' });
    }
    $('a', menu)?.focus();
  };
  const cerrar = (devolverFoco = true) => {
    menu.hidden = true;
    html.classList.remove('menu-abierto');
    toggle.setAttribute('aria-expanded', 'false');
    label.textContent = menu.dataset.abrir ?? 'Menú';
    lenis?.start();
    if (devolverFoco) toggle.focus();
  };
  toggle.addEventListener('click', () => (menu.hidden ? abrir() : cerrar()));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => cerrar(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) cerrar(); });
})();

/* ───────── anclas ───────── */

$$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')!;
    const target = id === '#' ? null : $(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) { lenis.resize(); lenis.scrollTo(target, { duration: 1.6 }); } else target.scrollIntoView();
    // Que el foco viaje con la vista: si no, el teclado se queda arriba.
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.replaceState(null, '', id);
  });
});

void finePointer;
// Solo en desarrollo: para inspeccionar la coreografía desde la consola.
if (import.meta.env.DEV) Object.assign(window, { __S: S, __mundo: () => mundo });
