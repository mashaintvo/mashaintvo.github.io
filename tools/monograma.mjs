/**
 * El monograma de María, en vector.
 *
 * Trazado sobre su render 3D (4 oct 2026) y redibujado con el estilo de su
 * tablero de marca: monolínea, puntas redondas, degradado pastel que corre a
 * lo largo del trazo. Sin la curva aguamarina que colgaba bajo la M (la que
 * ella tachó): el aguamarina baja, hace un valle y sube por el conector
 * hasta el arquito.
 *
 * Dos trazos:
 *   M  pierna derecha → arco → brazo de la V → V → diagonal → cima → pierna
 *      exterior → U → pierna interior → cima aguamarina → valle → conector →
 *      arquito → punta.
 *   S  nace dentro del arco (tangente a él), baja en C por encima del brazo
 *      de la V y del conector, diagonal, cuenco amarillo, punta.
 *
 * Las medidas salen del esqueleto de la silueta del render a 1000 px de
 * ancho (assets-src/debug/esqueleto.cjs): rectas donde el render es recto,
 * empalmes circulares en las esquinas y curvas ajustadas por mínimos
 * cuadrados (Schneider) donde es orgánico.
 *
 *   npm run monograma                   → public/marca/*.svg (el ícono del sitio lo hace tools/icono.mjs)
 *   node tools/monograma.mjs --revisar  → además, el trazo superpuesto al render
 *                                         (necesita assets-src/marca/monograma-b.jpg)
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REVISAR = process.argv.includes('--revisar');

/** Grosor del trazo, en unidades del render a 1000 px. */
export const GROSOR = 54;

/* ───────── geometría ───────── */

const P = (x, y) => ({ x, y });
const suma = (a, b) => P(a.x + b.x, a.y + b.y);
const resta = (a, b) => P(a.x - b.x, a.y - b.y);
const por = (a, k) => P(a.x * k, a.y * k);
const punto = (a, b) => a.x * b.x + a.y * b.y;
const cruz = (a, b) => a.x * b.y - a.y * b.x;
const largo = (a) => Math.hypot(a.x, a.y);
const unit = (a) => por(a, 1 / largo(a));
const dist = (a, b) => largo(resta(a, b));

/** Cúbica de Bézier: [p0, p1, p2, p3]. */
const recta = (a, b) => [a, suma(a, por(resta(b, a), 1 / 3)), suma(a, por(resta(b, a), 2 / 3)), b];

function bez(c, t) {
  const u = 1 - t;
  return P(
    u * u * u * c[0].x + 3 * u * u * t * c[1].x + 3 * u * t * t * c[2].x + t * t * t * c[3].x,
    u * u * u * c[0].y + 3 * u * u * t * c[1].y + 3 * u * t * t * c[2].y + t * t * t * c[3].y,
  );
}
function bezD(c, t) {
  const u = 1 - t;
  return P(
    3 * u * u * (c[1].x - c[0].x) + 6 * u * t * (c[2].x - c[1].x) + 3 * t * t * (c[3].x - c[2].x),
    3 * u * u * (c[1].y - c[0].y) + 6 * u * t * (c[2].y - c[1].y) + 3 * t * t * (c[3].y - c[2].y),
  );
}
function bezDD(c, t) {
  const u = 1 - t;
  return P(
    6 * u * (c[2].x - 2 * c[1].x + c[0].x) + 6 * t * (c[3].x - 2 * c[2].x + c[1].x),
    6 * u * (c[2].y - 2 * c[1].y + c[0].y) + 6 * t * (c[3].y - 2 * c[2].y + c[1].y),
  );
}

/** Corte de las rectas a + t·da y b + s·db. */
function corte(a, da, b, db) {
  const t = cruz(resta(b, a), db) / cruz(da, db);
  return suma(a, por(da, t));
}

/** Arco de a0 a a1 (radianes, y hacia abajo) en cúbicas de ≤ 90°. */
function arco(c, r, a0, a1) {
  const n = Math.max(1, Math.ceil(Math.abs(a1 - a0) / (Math.PI / 2)));
  const out = [];
  for (let i = 0; i < n; i++) {
    const t0 = a0 + ((a1 - a0) * i) / n;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / n;
    const k = (4 / 3) * Math.tan((t1 - t0) / 4) * r;
    const p0 = P(c.x + r * Math.cos(t0), c.y + r * Math.sin(t0));
    const p3 = P(c.x + r * Math.cos(t1), c.y + r * Math.sin(t1));
    out.push([p0, suma(p0, por(P(-Math.sin(t0), Math.cos(t0)), k)), resta(p3, por(P(-Math.sin(t1), Math.cos(t1)), k)), p3]);
  }
  return out;
}

/** Arco del centro c entre dos puntos, girando hacia `lado` (+1 horario en pantalla). */
function arcoEntre(c, r, desde, hasta, lado) {
  const a0 = Math.atan2(desde.y - c.y, desde.x - c.x);
  let a1 = Math.atan2(hasta.y - c.y, hasta.x - c.x);
  if (lado > 0) while (a1 <= a0) a1 += 2 * Math.PI;
  else while (a1 >= a0) a1 -= 2 * Math.PI;
  return arco(c, r, a0, a1);
}

/**
 * Empalme circular de radio R entre una recta de entrada (punto a, sentido
 * de avance da) y una de salida (punto b, sentido db).
 */
function empalme(a, da, b, db, R) {
  da = unit(da); db = unit(db);
  const v = corte(a, da, b, db);
  const giro = Math.acos(Math.max(-1, Math.min(1, punto(da, db))));
  const t = R * Math.tan(giro / 2);
  const t1 = resta(v, por(da, t));
  const t2 = suma(v, por(db, t));
  const lado = Math.sign(cruz(da, db));
  const c = suma(t1, por(P(-da.y * lado, da.x * lado), R));
  return { v, t1, t2, c, curvas: arcoEntre(c, R, t1, t2, lado) };
}

/** Distancia con signo de p a la recta (a, d). */
const aRecta = (p, a, d) => cruz(unit(d), resta(p, a));
/** Pie de la perpendicular de p sobre la recta (a, d). */
const pie = (p, a, d) => { const u = unit(d); return suma(a, por(u, punto(resta(p, a), u))); };

/**
 * La U: arco tangente a dos rectas casi paralelas (bajada y subida) cuyo
 * punto más bajo queda en yFondo.
 */
function arcoU(a, da, b, db, yFondo) {
  // Centro sobre la mediana: misma distancia a ambas rectas.
  const centroEn = (y) => {
    let lo = Math.min(a.x, b.x) - 400, hi = Math.max(a.x, b.x) + 400;
    const f = (x) => Math.abs(aRecta(P(x, y), a, da)) - Math.abs(aRecta(P(x, y), b, db));
    for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; (f(lo) * f(m) <= 0) ? (hi = m) : (lo = m); }
    const c = P((lo + hi) / 2, y);
    return { c, r: Math.abs(aRecta(c, a, da)) };
  };
  let lo = yFondo - 400, hi = yFondo;
  for (let i = 0; i < 80; i++) {
    const m = (lo + hi) / 2;
    const { c, r } = centroEn(m);
    (c.y + r > yFondo) ? (hi = m) : (lo = m);
  }
  const { c, r } = centroEn((lo + hi) / 2);
  const t1 = pie(c, a, da), t2 = pie(c, b, db);
  // Con rectas casi antiparalelas el giro sale del lado en que queda el centro.
  return { c, r, t1, t2, curvas: arcoEntre(c, r, t1, t2, Math.sign(cruz(unit(da), resta(c, t1)))) };
}

/* ───────── ajuste de curvas (Schneider, «An algorithm for automatically fitting digitized curves») ───────── */

function parametrosCuerda(pts) {
  const u = [0];
  for (let i = 1; i < pts.length; i++) u.push(u[i - 1] + dist(pts[i], pts[i - 1]));
  const L = u[u.length - 1];
  return u.map((v) => v / L);
}
function generar(pts, u, tIni, tFin) {
  const p0 = pts[0], p3 = pts[pts.length - 1];
  let c00 = 0, c01 = 0, c11 = 0, x0 = 0, x1 = 0;
  for (let i = 0; i < pts.length; i++) {
    const t = u[i], s = 1 - t;
    const b0 = s * s * s, b1 = 3 * s * s * t, b2 = 3 * s * t * t, b3 = t * t * t;
    const A1 = por(tIni, b1), A2 = por(tFin, -b2);
    c00 += punto(A1, A1); c01 += punto(A1, A2); c11 += punto(A2, A2);
    const tmp = resta(pts[i], suma(por(p0, b0 + b1), por(p3, b2 + b3)));
    x0 += punto(A1, tmp); x1 += punto(A2, tmp);
  }
  const det = c00 * c11 - c01 * c01;
  let a1 = det === 0 ? 0 : (x0 * c11 - x1 * c01) / det;
  let a2 = det === 0 ? 0 : (c00 * x1 - c01 * x0) / det;
  const seg = dist(p0, p3);
  if (a1 < seg * 1e-3 || a2 < seg * 1e-3) a1 = a2 = seg / 3;
  return [p0, suma(p0, por(tIni, a1)), resta(p3, por(tFin, a2)), p3];
}
function errorMax(pts, u, c) {
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = dist(bez(c, u[i]), pts[i]);
    if (d > max) { max = d; idx = i; }
  }
  return { max, idx };
}
function reparametrizar(pts, u, c) {
  return u.map((t, i) => {
    const d = resta(bez(c, t), pts[i]);
    const d1 = bezD(c, t), d2 = bezDD(c, t);
    const num = punto(d, d1), den = punto(d1, d1) + punto(d, d2);
    return den === 0 ? t : Math.min(1, Math.max(0, t - num / den));
  });
}
/** tIni y tFin: sentido de avance en los extremos (unitarios). */
function ajustar(pts, tIni, tFin, tol = 1.5) {
  tIni = unit(tIni); tFin = unit(tFin);
  if (pts.length === 2) {
    const d = dist(pts[0], pts[1]) / 3;
    return [[pts[0], suma(pts[0], por(tIni, d)), resta(pts[1], por(tFin, d)), pts[1]]];
  }
  let u = parametrosCuerda(pts);
  let c = generar(pts, u, tIni, tFin);
  let { max, idx } = errorMax(pts, u, c);
  for (let it = 0; it < 12 && max > tol; it++) {
    u = reparametrizar(pts, u, c);
    c = generar(pts, u, tIni, tFin);
    ({ max, idx } = errorMax(pts, u, c));
  }
  if (max <= tol) return [c];
  const tMedio = unit(resta(pts[idx + 1], pts[idx - 1]));
  return [...ajustar(pts.slice(0, idx + 1), tIni, tMedio, tol), ...ajustar(pts.slice(idx), tMedio, tFin, tol)];
}

/* ───────── el dibujo ───────── */

// Rectas del render (centros de la silueta, escala 1000).
const PIERNA_DER = { a: P(853, 200), d: unit(P(0.1, 1)) };           // x = 853 + 0,1·(y − 200)
const BRAZO_V = { a: P(542, 250), d: unit(P(-0.59, 1)) };           // x = 542 − 0,59·(y − 250)
const DIAGONAL = { a: P(440, 260), d: unit(P(0.667, 1)) };          // x = 440 + 0,667·(y − 260)
const PIERNA_EXT = { a: P(150, 180), d: unit(P(-0.188, 1)) };       // x = 150 − 0,188·(y − 180)
const PIERNA_INT = { a: P(278, 360), d: unit(P(-0.177, 1)) };       // x = 278 − 0,177·(y − 360)
const CONECTOR = { a: P(592, 364), d: unit(P(0.55, -0.835)) };
const ARQUITO_DER = { a: P(729.5, 275), d: unit(P(0.08, 1)) };
const DIAG_S = { a: P(650, 347), d: unit(P(1, 0.307)) };            // y = 347 + 0,307·(x − 650)

const R_V = 36, R_CIMA_AGUA = 10, R_VALLE = 60, R_ARQUITO = 22;
const FONDO_U = 722, ALTO_CIMA = 58;

const neg = (d) => por(d, -1);

function construirM() {
  const curvas = [];
  const fin = () => curvas[curvas.length - 1][3];
  // Punto medio de un empalme (para tapar la cuña interior de las esquinas cerradas).
  const medio = (cs) => { const c = cs[Math.floor(cs.length / 2)]; return cs.length % 2 ? bez(c, 0.5) : c[0]; };

  // 1 · pierna derecha, de la punta hacia arriba
  const puntaDer = P(866, 330);
  const arranqueArco = P(853, 200);
  curvas.push(recta(puntaDer, arranqueArco));

  // 2 · el arco, ajustado al esqueleto, hasta caer sobre el brazo de la V
  const finArco = P(BRAZO_V.a.x + (150 - BRAZO_V.a.y) * (BRAZO_V.d.x / BRAZO_V.d.y), 150);
  const ptsArco = [
    arranqueArco, P(851, 190), P(850, 180), P(848, 170), P(845, 160), P(843, 150), P(840, 140), P(835, 130), P(830, 120),
    P(820, 105.5), P(810, 94.5), P(800, 86), P(790, 80), P(780, 75), P(770, 71), P(760, 69), P(750, 68), P(740, 68),
    P(730, 68), P(720, 69), P(710, 70), P(700, 72), P(690, 76), P(680, 80), P(670, 85), P(660, 91.5), P(650, 98),
    P(640, 106.5), P(630, 116), P(620, 126.5), finArco,
  ];
  curvas.push(...ajustar(ptsArco, neg(PIERNA_DER.d), BRAZO_V.d, 1.2));

  // 3 · brazo de la V, V y diagonal
  const v = empalme(fin(), BRAZO_V.d, DIAGONAL.a, neg(DIAGONAL.d), R_V);
  curvas.push(recta(fin(), v.t1));
  curvas.push(...v.curvas);

  // 4 · la cima rosa: círculo tangente a la diagonal y a la pierna exterior, con la cima en ALTO_CIMA
  const cima = (() => {
    let lo = 20, hi = 300;
    let e;
    for (let i = 0; i < 80; i++) {
      const R = (lo + hi) / 2;
      e = empalme(v.t2, neg(DIAGONAL.d), PIERNA_EXT.a, PIERNA_EXT.d, R);
      // a mayor radio, el círculo baja: si la cima queda alta, falta radio
      (e.c.y - R < ALTO_CIMA) ? (lo = R) : (hi = R);
    }
    return e;
  })();
  curvas.push(recta(fin(), cima.t1));
  curvas.push(...cima.curvas);

  // 5 · pierna exterior y U
  const u = arcoU(PIERNA_EXT.a, PIERNA_EXT.d, PIERNA_INT.a, neg(PIERNA_INT.d), FONDO_U);
  curvas.push(recta(fin(), u.t1));
  curvas.push(...u.curvas);

  // 6 · pierna interior hasta la cima aguamarina (casi en punta)
  const inicioAgua = P(325, 296);
  const dirAgua = unit(P(0.53, 0.848));
  const ca = empalme(fin(), neg(PIERNA_INT.d), inicioAgua, dirAgua, R_CIMA_AGUA);
  curvas.push(recta(fin(), ca.t1));
  curvas.push(...ca.curvas);

  // 7 · la diagonal aguamarina, que se aplana; luego el valle (lo nuevo) y el conector
  const dirLlegada = unit(P(0.995, 0.1));
  const valle = empalme(P(505, 443.5), dirLlegada, CONECTOR.a, CONECTOR.d, R_VALLE);
  const ptsAgua = [
    ca.t2, P(350, 333.5), P(375, 362), P(400, 390), P(425, 411), P(450, 427), P(475, 438), valle.t1,
  ];
  curvas.push(...ajustar(ptsAgua, dirAgua, dirLlegada, 1.2));
  curvas.push(...valle.curvas);

  // 8 · conector y arquito
  const arq = empalme(valle.t2, CONECTOR.d, ARQUITO_DER.a, ARQUITO_DER.d, R_ARQUITO);
  curvas.push(recta(fin(), arq.t1));
  curvas.push(...arq.curvas);
  const puntaArquito = P(ARQUITO_DER.a.x + (294 - ARQUITO_DER.a.y) * (ARQUITO_DER.d.x / ARQUITO_DER.d.y), 294);
  curvas.push(recta(fin(), puntaArquito));

  return { curvas, esquinas: [medio(ca.curvas), medio(arq.curvas)] };
}

function construirS() {
  const curvas = [];
  // Nace sobre el brazo de la V (que ahí ya es el arco), tangente a él, y baja
  // casi vertical dejando ver medio brazo a su izquierda (cara frontal del render).
  const q = P(BRAZO_V.a.x + (170 - BRAZO_V.a.y) * (BRAZO_V.d.x / BRAZO_V.d.y), 170);
  const j = P(705, DIAG_S.a.y + (705 - DIAG_S.a.x) * (DIAG_S.d.y / DIAG_S.d.x));
  const ptsC = [q, P(582.5, 200), P(582, 225), P(584, 248), P(590, 272), P(602, 294), j];
  curvas.push(...ajustar(ptsC, BRAZO_V.d, DIAG_S.d, 1.5));
  // La recta termina antes de que el esqueleto empiece a curvar (≈ x 790), para que el cuenco entre sin quiebre.
  const finDiag = P(790, DIAG_S.a.y + (790 - DIAG_S.a.x) * (DIAG_S.d.y / DIAG_S.d.x));
  curvas.push(recta(j, finDiag));
  const ptsCuenco = [
    finDiag, P(800, 393), P(810, 397), P(820, 400.5), P(830, 405), P(840, 409), P(850, 414.5), P(860, 420), P(870, 427.5), P(880, 435), P(890, 444.5), P(900, 455.5), P(910, 470),
    P(916, 480), P(921, 490), P(925, 500), P(928, 510), P(930, 520), P(931.5, 530), P(933, 540), P(934, 550), P(934, 560),
    P(933, 570), P(932, 580), P(931, 590), P(929, 600), P(926, 610), P(922, 620), P(917, 630), P(910, 640), P(901.5, 650),
    P(889.5, 660), P(871, 669), P(845, 675), P(817, 670), P(797, 661), P(784, 650), P(776.5, 640), P(771, 630), P(767, 620),
    P(764, 610), P(761, 600), P(759, 590), P(757, 580), P(756, 570), P(754, 560), P(753, 550), P(752, 540), P(751, 530),
    P(750, 520), P(749, 510), P(748, 500), P(747, 490), P(746, 480), P(744.5, 462),
  ];
  curvas.push(...ajustar(ptsCuenco, DIAG_S.d, unit(P(-0.08, -1)), 1.5));
  return { curvas };
}

/* ───────── longitudes, tramos y color ───────── */

function tabla(curvas) {
  const filas = [];
  let s = 0;
  curvas.forEach((c, i) => {
    let prev = c[0];
    for (let k = 1; k <= 64; k++) {
      const t = k / 64;
      const p = bez(c, t);
      s += dist(p, prev);
      filas.push({ i, t, s });
      prev = p;
    }
  });
  return { filas, total: s, curvas };
}
function enS(tab, s) {
  if (s <= 0) return { i: 0, t: 0 };
  const f = tab.filas;
  let lo = 0, hi = f.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; (f[m].s < s) ? (lo = m + 1) : (hi = m); }
  const b = f[lo], a = lo > 0 ? f[lo - 1] : { i: b.i, t: 0, s: 0 };
  if (a.i !== b.i) return { i: b.i, t: b.t * Math.min(1, Math.max(0, (s - a.s) / (b.s - a.s || 1))) };
  return { i: b.i, t: a.t + (b.t - a.t) * ((s - a.s) / (b.s - a.s || 1)) };
}
const puntoEn = (tab, s) => { const { i, t } = enS(tab, s); return bez(tab.curvas[i], t); };
const tangenteEn = (tab, s) => { const { i, t } = enS(tab, s); return unit(bezD(tab.curvas[i], t)); };

function partir(c, t) {
  const l = (a, b) => suma(a, por(resta(b, a), t));
  const a = l(c[0], c[1]), b = l(c[1], c[2]), d = l(c[2], c[3]);
  const e = l(a, b), f = l(b, d), g = l(e, f);
  return [[c[0], a, e, g], [g, f, d, c[3]]];
}
function subcurva(c, t0, t1) {
  if (t0 <= 0 && t1 >= 1) return c;
  let x = c;
  if (t1 < 1) x = partir(x, t1)[0];
  if (t0 > 0) x = partir(x, t0 / t1)[1];
  return x;
}
function tramo(tab, s0, s1) {
  const a = enS(tab, Math.max(0, s0)), b = enS(tab, Math.min(tab.total, s1));
  const out = [];
  for (let i = a.i; i <= b.i; i++) {
    const t0 = i === a.i ? a.t : 0, t1 = i === b.i ? b.t : 1;
    if (t1 - t0 <= 1e-6) continue;
    const c = subcurva(tab.curvas[i], t0, t1);
    // Un trocito diminuto (al caer justo en una unión) deja la punta recta
    // mal orientada al redondear: abre una grieta. Fuera.
    if (dist(c[0], c[3]) < 0.4 && (out.length || i < b.i)) continue;
    out.push(c);
  }
  return out;
}

const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;
const fmt = (p, o) => `${r2(p.x - o.x)} ${r2(p.y - o.y)}`;
function d(curvas, o = P(0, 0)) {
  if (!curvas.length) return '';
  return `M${fmt(curvas[0][0], o)}` + curvas.map((c) => `C${fmt(c[1], o)} ${fmt(c[2], o)} ${fmt(c[3], o)}`).join('');
}

// OKLab, para que los cruces de color no se ensucien.
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function aLab(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = lin(((n >> 16) & 255) / 255), g = lin(((n >> 8) & 255) / 255), b = lin((n & 255) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function deLab([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return '#' + rgb.map((c) => Math.round(Math.min(1, Math.max(0, gam(c))) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}
function colorEn(paradas, s) {
  if (s <= paradas[0][0]) return paradas[0][1];
  for (let i = 1; i < paradas.length; i++) {
    const [s1, c1] = paradas[i];
    if (s <= s1) {
      const [s0, c0] = paradas[i - 1];
      const k = (s - s0) / (s1 - s0 || 1);
      const a = aLab(c0), b = aLab(c1);
      return deLab(a.map((v, j) => v + (b[j] - v) * k));
    }
  }
  return paradas[paradas.length - 1][1];
}

export { construirM, construirS, tabla, tramo, puntoEn, tangenteEn, d, colorEn, P };

/* ───────── salida ───────── */

const M = construirM();
const S = construirS();
const tM = tabla(M.curvas);
const tS = tabla(S.curvas);

// Posiciones de referencia a lo largo de cada trazo (arco recorrido).
function sMasCercano(tab, p) {
  let best = 0, bd = Infinity;
  for (let s = 0; s <= tab.total; s += 1) { const q = puntoEn(tab, s); const dd = dist(p, q); if (dd < bd) { bd = dd; best = s; } }
  return best;
}
const anclaM = {
  punta: 0,
  cimaArco: sMasCercano(tM, P(740, 68)),
  nacimientoS: sMasCercano(tM, S.curvas[0][0]),
  v: sMasCercano(tM, P(488, 300)),
  cima: sMasCercano(tM, P(255, 58)),
  piernaMitad: sMasCercano(tM, P(110, 390)),
  u: sMasCercano(tM, P(146, 722)),
  piernaIntBaja: sMasCercano(tM, P(232, 620)),
  piernaIntAlta: sMasCercano(tM, P(272, 400)),
  cimaAgua: sMasCercano(tM, P(298, 262)),
  valle: sMasCercano(tM, P(520, 449)),
  cruceS: sMasCercano(tM, P(610, 335)),
  arquito: sMasCercano(tM, P(709, 212)),
  final: tM.total,
};
const anclaS = {
  inicio: 0,
  c: sMasCercano(tS, P(584, 250)),
  cruce: sMasCercano(tS, P(625, 317)),
  diagMitad: sMasCercano(tS, P(760, 381)),
  cuencoDer: sMasCercano(tS, P(934, 555)),
  fondo: sMasCercano(tS, P(845, 675)),
  final: tS.total,
};

export const COLORES = {
  rosa: '#F3B0C3', aqua: '#8EE3D3', lila: '#B8A9E8', amarillo: '#FDF0A6',
};
const paradasM = [
  [anclaM.punta, '#AE9EE6'],
  [anclaM.cimaArco, '#B8A9E8'],
  [anclaM.nacimientoS, '#BFA9E6'],
  [anclaM.v, '#E7AECF'],
  [anclaM.v + (anclaM.cima - anclaM.v) * 0.45, '#F3B0C3'],
  [anclaM.cima, '#F5B5C6'],
  [anclaM.u, '#F3B0C3'],
  [anclaM.piernaIntBaja, '#F1B4C6'],
  [anclaM.piernaIntAlta, '#BFD3DA'],
  [anclaM.cimaAgua, '#8EE3D3'],
  [anclaM.valle, '#8EE3D3'],
  [anclaM.cruceS, '#99C9EA'],
  [anclaM.arquito, '#AEB2EE'],
  [anclaM.final, '#C9BFF0'],
];
const paradasS = [
  [anclaS.inicio, '#BFA9E6'],
  [anclaS.c, '#B8A9E8'],
  [anclaS.cruce, '#BDA9E6'],
  [anclaS.diagMitad, '#E7C4D4'],
  [anclaS.cuencoDer, '#FDF0A6'],
  [anclaS.fondo, '#FBEA9C'],
  [anclaS.final, '#FDF0A6'],
];

/**
 * Trocea el trazo en tramos con su degradado lineal (puntas rectas, con un
 * pelo de solape para que no se vea la costura) y redondea los dos extremos
 * con un disco del color de la punta.
 */
function tramos(tab, paradas, prefijo, o, { paso = 56, discos = [], grosor = GROSOR } = {}) {
  const cortes = [0];
  for (let s = paso; s < tab.total - paso / 2; s += paso) cortes.push(s);
  cortes.push(tab.total);
  const defs = [], capas = [];
  const SOLAPE = 3;
  for (let k = 0; k < cortes.length - 1; k++) {
    const s0 = cortes[k], s1 = cortes[k + 1];
    const a = Math.max(0, s0 - SOLAPE), b = Math.min(tab.total, s1 + SOLAPE);
    const c0 = colorEn(paradas, a), c1 = colorEn(paradas, b);
    const p0 = puntoEn(tab, a), p1 = puntoEn(tab, b);
    let trazo;
    if (c0 === c1) trazo = c0;
    else {
      const id = `${prefijo}${k}`;
      defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${r1(p0.x - o.x)}" y1="${r1(p0.y - o.y)}" x2="${r1(p1.x - o.x)}" y2="${r1(p1.y - o.y)}"><stop stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient>`);
      trazo = `url(#${id})`;
    }
    capas.push({ desde: s0, svg: `<path d="${d(tramo(tab, a, b), o)}" stroke="${trazo}"/>` });
  }
  // Discos: las dos puntas redondas y la cuña interior de las esquinas cerradas.
  const disco = (s) => { const p = puntoEn(tab, s); return `<circle cx="${r2(p.x - o.x)}" cy="${r2(p.y - o.y)}" r="${grosor / 2}" fill="${colorEn(paradas, s)}"/>`; };
  return { defs, capas, inicio: disco(0), fin: disco(tab.total), esquinas: discos.map(disco) };
}

function limites(grosor = GROSOR) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const tab of [tM, tS]) for (let s = 0; s <= tab.total; s += 2) {
    const p = puntoEn(tab, s);
    x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
  }
  const m = grosor / 2 + 1;
  return { x: x0 - m, y: y0 - m, w: x1 - x0 + 2 * m, h: y1 - y0 + 2 * m };
}

/**
 * El SVG del monograma.
 * - color: 'degradado' | un color sólido (con un hueco fino donde la S
 *   pasa por encima del conector, para que el cruce se lea)
 * - sombra: sombra corta de la S sobre el conector (solo con degradado)
 * - volumen: brillo suave de tubo, como en su tablero
 * - id: prefijo de los identificadores internos (varios SVG en una página)
 */
export function svgMonograma({ color = 'degradado', sombra = true, volumen = false, fondo = null, id = 'ms', grosor = GROSOR, paso = 56 } = {}) {
  const g = grosor;
  const L = limites(g);
  const o = P(L.x, L.y);
  const w = r1(L.w), h = r1(L.h);
  const defs = [];
  const forma = (curvas) => `<path d="${d(curvas, o)}" stroke="#fff" stroke-width="${g}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const mascara = (nombre, contenido) => `<mask id="${id}-${nombre}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">${contenido}</mask>`;
  // Donde la S ya se separó del arco (por encima de este punto, S y arco son el mismo tubo).
  const sHorquilla = sMasCercano(tS, P(582, 222));
  const cruce = tramo(tS, anclaS.cruce - 40, anclaS.cruce + 48);

  // Orden de capas: cuerpo M → nacimiento de la S → brillo M → sombra → resto de la S → brillo S.
  // El nacimiento va bajo el brillo de la M para que el brillo del arco siga sin corte.
  let cuerpoM, nacimientoS, restoS;
  if (color === 'degradado') {
    const m = tramos(tM, paradasM, `${id}m`, o, { discos: M.esquinas.map((p) => sMasCercano(tM, p)), grosor: g, paso });
    const s = tramos(tS, paradasS, `${id}s`, o, { grosor: g, paso });
    defs.push(...m.defs, ...s.defs);
    cuerpoM = m.capas.map((c) => c.svg).join('') + m.inicio + m.fin + m.esquinas.join('');
    nacimientoS = s.inicio + s.capas.filter((c) => c.desde < sHorquilla).map((c) => c.svg).join('');
    restoS = s.capas.filter((c) => c.desde >= sHorquilla).map((c) => c.svg).join('') + s.fin;
  } else {
    // Un solo color: la M se recorta a lo largo de la S para que se lea quién
    // pasa por encima. El hueco nace en cero en la horquilla y llega a 5
    // unidades por lado antes de separarse del brazo de la V.
    const hueco = [];
    const RAMPA = 48, PASOS = 8;
    for (let i = 0; i < PASOS; i++) {
      const s0 = (RAMPA * i) / PASOS, s1 = (RAMPA * (i + 1)) / PASOS + 0.5;
      hueco.push(`<path d="${d(tramo(tS, s0, s1), o)}" stroke="#000" stroke-width="${r1(g + (10 * (i + 1)) / PASOS)}"/>`);
    }
    hueco.push(`<path d="${d(tramo(tS, RAMPA, anclaS.cruce + 48), o)}" stroke="#000" stroke-width="${g + 10}"/>`);
    defs.push(mascara('hueco', `<rect width="${w}" height="${h}" fill="#fff"/>${hueco.join('')}`));
    cuerpoM = `<path d="${d(M.curvas, o)}" stroke="${color}" stroke-linecap="round" mask="url(#${id}-hueco)"/>`;
    nacimientoS = '';
    restoS = `<path d="${d(S.curvas, o)}" stroke="${color}" stroke-linecap="round"/>`;
  }
  let capaSombra = '';
  if (sombra && color === 'degradado') {
    defs.push(
      // Región del filtro en coordenadas del dibujo: con trazos cortos, la región
      // relativa (porcentaje de su caja) recorta el difuminado en rectángulo.
      `<filter id="${id}-difuso" filterUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><feGaussianBlur stdDeviation="5"/></filter>`,
      mascara('sobreM', forma(M.curvas)),
    );
    capaSombra = `<g mask="url(#${id}-sobreM)"><path d="${d(cruce, o)}" stroke="#3A2A66" stroke-opacity="0.34" stroke-width="${g + 10}" filter="url(#${id}-difuso)"/></g>`;
  }
  let brilloM = '', brilloS = '';
  if (volumen) {
    const k = g;
    const desplaza = `translate(${r1(-k * 0.08)} ${r1(-k * 0.11)})`;
    defs.push(
      `<filter id="${id}-brillo" filterUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><feGaussianBlur stdDeviation="${r1(k * 0.09)}"/></filter>`,
      mascara('enM', forma(M.curvas)),
      mascara('enS', forma(S.curvas)),
    );
    const luz = (curvas, m, extra = '') => `<g mask="url(#${id}-${m})"><path d="${d(curvas, o)}" stroke="#fff" stroke-opacity="0.26" stroke-width="${r1(k * 0.32)}" stroke-linecap="round" transform="${desplaza}" filter="url(#${id}-brillo)"${extra}/></g>`;
    brilloM = luz(M.curvas, 'enM');
    // El brillo de la S entra fundido donde se separa del arco.
    const p0 = puntoEn(tS, sHorquilla), p1 = puntoEn(tS, sHorquilla + 60);
    defs.push(`<linearGradient id="${id}-entra" gradientUnits="userSpaceOnUse" x1="${r1(p0.x - o.x)}" y1="${r1(p0.y - o.y)}" x2="${r1(p1.x - o.x)}" y2="${r1(p1.y - o.y)}"><stop stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>`);
    brilloS = luz(tramo(tS, sHorquilla, sHorquilla + 60), 'enS', ` style="stroke:url(#${id}-entra)"`) + luz(tramo(tS, sHorquilla + 59, tS.total), 'enS');
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none" stroke-width="${g}" stroke-linejoin="round">` +
    (fondo ? `<rect width="${w}" height="${h}" fill="${fondo}"/>` : '') +
    (defs.length ? `<defs>${defs.join('')}</defs>` : '') +
    `<g>${cuerpoM}${nacimientoS}</g>${brilloM}${capaSombra}<g>${restoS}</g>${brilloS}</svg>`;
}

export const PROPORCION = (() => { const L = limites(); return L.w / L.h; })();

/** Baldosa berenjena de esquinas redondeadas con el monograma: favicon e íconos. */
export function svgIcono(lado = 512, { grosor = 74, paso = 56 } = {}) {
  const L = limites(grosor);
  const ancho = lado * 0.8, alto = ancho / (L.w / L.h);
  const mono = svgMonograma({ sombra: false, id: 'i', grosor, paso })
    .replace(/ width="[\d.]+" height="[\d.]+"/, ` x="${r1((lado - ancho) / 2)}" y="${r1((lado - alto) / 2)}" width="${r1(ancho)}" height="${r1(alto)}"`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lado} ${lado}" width="${lado}" height="${lado}"><rect width="${lado}" height="${lado}" rx="${r1(lado * 0.22)}" fill="#0F0A14"/>${mono}</svg>`;
}

const esPrincipal = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (esPrincipal) {
  const sharp = (await import('sharp')).default;
  const marca = resolve(root, 'public/marca');
  await mkdir(marca, { recursive: true });
  const salidas = {
    // vector puro, sin filtros: header, hoja de vida, 404
    'marca/monograma.svg': svgMonograma({ sombra: false }),
    // con sombra en el cruce y brillo de tubo: pantalla de carga, pie, tarjeta para redes
    'marca/monograma-volumen.svg': svgMonograma({ volumen: true }),
    // un color, con el hueco donde la S pasa por encima
    'marca/monograma-lila.svg': svgMonograma({ color: COLORES.lila }),
    // (el ícono del sitio ya no es el monograma: lo hace tools/icono.mjs con «ms»)
  };
  for (const [nombre, svg] of Object.entries(salidas)) {
    await writeFile(resolve(root, 'public', nombre), svg);
    console.log(`${nombre.padEnd(28)} ${(svg.length / 1024).toFixed(1)} KB`);
  }
  // Las dos líneas centrales, para que el sitio dibuje el monograma trazo a trazo
  // (pantalla de carga y pie): una máscara que avanza sobre la imagen.
  const L = limites();
  const o = P(L.x, L.y);
  const trazo = `// Generado por tools/monograma.mjs (npm run monograma). No editar a mano.
/** Las líneas centrales del monograma, en el sistema del viewBox de public/marca/*.svg. */
export const TRAZO = {
  ancho: ${r1(L.w)},
  alto: ${r1(L.h)},
  grosor: ${GROSOR},
  /** pierna derecha → arco → V → cima → U → aguamarina → valle → conector → arquito */
  m: '${d(M.curvas, o)}',
  /** nace en el arco, baja en C, cruza el conector, cuenco amarillo */
  s: '${d(S.curvas, o)}',
  largoM: ${r1(tM.total)},
  largoS: ${r1(tS.total)},
  /** dónde nace la S, medido a lo largo de la M */
  horquilla: ${r1(anclaM.nacimientoS)},
} as const;
`;
  await writeFile(resolve(root, 'src/datos/monograma-trazo.ts'), trazo);
  console.log(`src/datos/monograma-trazo.ts   ${(trazo.length / 1024).toFixed(1)} KB`);

  console.log(`proporción ${PROPORCION.toFixed(4)}`);

  if (REVISAR) {
    const dbg = resolve(root, 'assets-src/debug');
    await mkdir(dbg, { recursive: true });
    // El render de María recortado a su caja y a 1000 px: el marco de las medidas.
    const fuente = resolve(root, 'assets-src/marca/monograma-b.jpg');
    if (!existsSync(fuente)) throw new Error('Falta assets-src/marca/monograma-b.jpg (el render original, fuera de git).');
    const base = await sharp(fuente).extract({ left: 679, top: 192, width: 1457, height: 1144 }).resize({ width: 1000 }).png().toBuffer();
    const meta = await sharp(base).metadata();
    const O = P(0, 0);
    const lineas = [M, S].map((t) => `<path d="${d(t.curvas, O)}" stroke="#2155ff" stroke-opacity="0.28" stroke-width="${GROSOR}" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="${d(t.curvas, O)}" stroke="#e00" stroke-width="2" fill="none"/>`).join('');
    const extremos = [...M.curvas, ...S.curvas].map((c) => `<circle cx="${r1(c[0].x)}" cy="${r1(c[0].y)}" r="3" fill="#000"/>`).join('');
    await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}">${lineas}${extremos}</svg>`) }]).png().toFile(resolve(dbg, 'vector-revision.png'));
    await sharp(Buffer.from(svgMonograma({ fondo: '#0F0A14' }))).resize({ width: 900 }).png().toFile(resolve(dbg, 'vector-oscuro.png'));
    await sharp(Buffer.from(svgMonograma({ fondo: '#F4F2F7' }))).resize({ width: 900 }).png().toFile(resolve(dbg, 'vector-claro.png'));
    console.log('revisión: assets-src/debug/vector-revision.png · vector-oscuro.png · vector-claro.png');
  }
}
