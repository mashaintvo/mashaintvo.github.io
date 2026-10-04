/**
 * Las cuatro piezas del caso Lúmina Campus. Todo con datos ficticios: un
 * colegio de demostración, y los menores solo con número. Las reglas y los
 * textos son los del producto (src/datos/campus.ts dice de dónde sale cada uno);
 * en la versión en inglés del portafolio, traducidos.
 */
import '@fontsource-variable/inter';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/jetbrains-mono';
import {
  AVISO_ESTUDIANTE, CONVERSACION, CORTES, DESEMPENO_TEXTO, DIRECTORIO, NIVEL_TEXTO, PRESETS_SAT, TEXTO_403, TEXTO_SUPERVISOR_403, YO,
  desempeno, evaluarSat, puedeEscribir, round1, type Lang, type Rol,
} from '../datos/campus';

interface Opciones { reduced: boolean; lang: Lang }

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(s));
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Activa una opción del control segmentado y repite su animación (onda y chispas). */
function activar(opciones: HTMLElement[], elegida: HTMLElement) {
  opciones.forEach((b) => b.dataset.activo = 'false');
  void elegida.offsetWidth; // fuerza el reflujo: así la animación vuelve a empezar
  elegida.dataset.activo = 'true';
}

/* ───────── alerta temprana ───────── */

function sat(el: HTMLElement, o: Opciones) {
  const t = (en: string, es: string) => (o.lang === 'es' ? es : en);
  const campos = Object.fromEntries($$<HTMLInputElement>('[data-sat]', el).map((i) => [i.dataset.sat!, i]));
  const outs = Object.fromEntries($$('[data-sat-out]', el).map((x) => [x.dataset.satOut!, x]));
  const semaforo = $('[data-sat-semaforo]', el);
  const nivel = $('[data-sat-nivel]', el);
  const motivos = $('[data-sat-motivos]', el);
  const registro = $('[data-sat-registro]', el);
  const presets = $$<HTMLButtonElement>('[data-sat-preset]', el);
  let quien: string = PRESETS_SAT[0].nombre[o.lang];

  const leer = () => ({
    promedio: round1(Number(campos.promedio.value)),
    asistencia: Math.round(Number(campos.asistencia.value)),
    tendencia: round1(Number(campos.tendencia.value)),
    minimo: round1(Number(campos.minimo.value)),
  });
  const pintar = () => {
    const v = leer();
    outs.promedio.textContent = v.promedio.toFixed(1);
    outs.asistencia.textContent = `${v.asistencia} %`;
    outs.tendencia.textContent = (v.tendencia > 0 ? '+' : '') + v.tendencia.toFixed(1);
    outs.minimo.textContent = v.minimo.toFixed(1);
    const r = evaluarSat(v, o.lang);
    if (semaforo) semaforo.dataset.nivel = r.nivel;
    if (nivel) nivel.textContent = NIVEL_TEXTO[r.nivel][o.lang];
    if (motivos) motivos.innerHTML = r.motivos.length ? r.motivos.map((m) => `<li>${esc(m)}</li>`).join('') : `<li>${t('No risk signals', 'Sin señales de riesgo')}</li>`;
  };
  Object.values(campos).forEach((i) => i.addEventListener('input', () => { if (registro) registro.innerHTML = ''; pintar(); }));
  presets.forEach((b) => b.addEventListener('click', () => {
    const p = PRESETS_SAT[Number(b.dataset.satPreset)];
    quien = p.nombre[o.lang];
    campos.promedio.value = String(p.promedio);
    campos.asistencia.value = String(p.asistencia);
    campos.tendencia.value = String(p.tendencia);
    activar(presets, b);
    if (registro) registro.innerHTML = '';
    pintar();
  }));
  $('[data-sat-avisar]', el)?.addEventListener('click', () => {
    const r = evaluarSat(leer(), o.lang);
    const motivo = r.motivos.length ? r.motivos.join('; ') : t('Preventive follow-up', 'Seguimiento preventivo');
    if (!registro) return;
    registro.innerHTML = [
      `POST /api/sat/notify · ${esc(quien)}`,
      t(`✓ in-app notice “Academic alert” · level ${NIVEL_TEXTO[r.nivel].en}`, `✓ notificación interna «Alerta académica» · nivel ${NIVEL_TEXTO[r.nivel].es}`),
      t('✓ email to the parent · simulated: nothing is sent from here', '✓ correo al acudiente · simulado: aquí no se envía nada'),
      `✓ audit_log · sat_alert_notified · ${esc(motivo)}`,
    ].map((l) => `<li>${l}</li>`).join('');
  });
  pintar();
}

/* ───────── chat ───────── */

function chat(el: HTMLElement, o: Opciones) {
  const roles = $$<HTMLButtonElement>('[data-chat-rol]', el);
  const supervisor = $<HTMLInputElement>('[data-chat-supervisor]', el);
  const directorio = $('[data-chat-directorio]', el);
  const panel = $('[data-chat-panel]', el);
  if (!directorio || !panel) return;
  let rol: Rol = 'teacher';
  const t = (en: string, es: string) => (o.lang === 'es' ? es : en);
  const nombre = (id: string) => DIRECTORIO.find((c) => c.id === id)!.nombre[o.lang];

  const avisoEstudiante = () => `<p class="chat__aviso"><strong>${AVISO_ESTUDIANTE[o.lang].fuerte}</strong> ${AVISO_ESTUDIANTE[o.lang].resto}</p>`;

  const lista = () => {
    const yo = YO[rol];
    const sup = supervisor?.checked;
    const filas: string[] = [];
    if (sup && rol === 'parent') {
      filas.push(`<li><button type="button" class="es-si es-sup" data-sup><span>${t('Conversations of Student 07', 'Conversaciones de Estudiante 07')}<small>${t('Read only · minor protection', 'Solo lectura · protección de menores')}</small></span><span class="chat__marca">${t('Read', 'Leer')}</span></button></li>`);
    }
    for (const c of DIRECTORIO) {
      if (c.id === yo) continue;
      const p = puedeEscribir(yo, c.id);
      filas.push(`<li><button type="button" class="${p.si ? 'es-si' : 'es-no'}" data-a="${c.id}"><span>${esc(c.nombre[o.lang])}<small>${esc(c.detalle[o.lang])}</small></span><span class="chat__marca">${p.si ? t('Can write', 'Puede escribir') : t('Can’t', 'No puede')}</span></button></li>`);
    }
    directorio.innerHTML = filas.join('');
    panel.innerHTML = (sup && rol === 'student' ? avisoEstudiante() : '') + `<p class="chat__vacio">${t('Pick someone from the directory.', 'Elige a alguien del directorio.')}</p>`;
  };

  directorio.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button');
    if (!b) return;
    const sup = supervisor?.checked;
    if (b.hasAttribute('data-sup')) {
      panel.innerHTML = `
        <p class="chat__aviso"><strong>${t('Read only.', 'Solo lectura.')}</strong> ${t('This conversation belongs to your student.', 'Esta conversación es de tu estudiante.')}</p>
        <div class="chat__burbujas">${CONVERSACION.map((m) => `<p class="chat__b ${m.de === 'e07' ? 'chat__b--mio' : ''}"><small>${esc(nombre(m.de))}</small><br>${esc(m.texto[o.lang])}</p>`).join('')}</div>
        <form class="chat__escribir" data-sup-form><label class="sr-only" for="chat-sup-msg">${t('Message', 'Mensaje')}</label><input id="chat-sup-msg" type="text" placeholder="${t('Write a message…', 'Escribir un mensaje…')}" /><button type="submit" class="btn-lumina btn-campus">${t('Send', 'Enviar')}</button></form>
        <p class="chat__auditoria">audit_log · chat.supervised.read · ${t('student: Student 07 · messages', 'estudiante: Estudiante 07 · mensajes')}: ${CONVERSACION.length}</p>`;
      $<HTMLFormElement>('[data-sup-form]', panel)?.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const err = document.createElement('p');
        err.className = 'chat__error';
        err.textContent = `403 · FORBIDDEN · ${TEXTO_SUPERVISOR_403[o.lang]}`;
        $('.chat__error', panel)?.remove();
        panel.append(err);
      });
      return;
    }
    const a = b.dataset.a!;
    const p = puedeEscribir(YO[rol], a);
    const c = DIRECTORIO.find((x) => x.id === a)!;
    const aviso = sup && rol === 'student' ? avisoEstudiante() : '';
    panel.innerHTML = p.si
      ? `${aviso}<p class="chat__auditoria">POST /api/chat/conversations → 201</p><p><b>${esc(c.nombre[o.lang])}</b><br><small>${esc(c.detalle[o.lang])}</small></p><p class="chat__vacio">${esc(p.porque[o.lang])}</p>`
      : `${aviso}<p class="chat__error">403 · FORBIDDEN · ${TEXTO_403[o.lang]}</p><p class="chat__vacio">${esc(p.porque[o.lang])}</p>`;
  });

  roles.forEach((b) => b.addEventListener('click', () => {
    rol = b.dataset.chatRol as Rol;
    activar(roles, b);
    lista();
  }));
  supervisor?.addEventListener('change', lista);
  lista();
}

/* ───────── boletín ───────── */

function boletin(el: HTMLElement, o: Opciones) {
  const t = (en: string, es: string) => (o.lang === 'es' ? es : en);
  const notas = $$<HTMLInputElement>('[data-nota]', el);
  const minimoIn = $<HTMLInputElement>('[data-boletin-minimo]', el);
  const promedio = $('[data-boletin-promedio]', el);
  const cortes = $('[data-boletin-cortes]', el);
  const leer = (i: HTMLInputElement, def: number) => {
    const v = Number(i.value.replace(',', '.'));
    return Number.isFinite(v) ? Math.min(5, Math.max(0, round1(v))) : def;
  };
  const pintar = () => {
    const minimo = minimoIn ? Math.min(4.5, Math.max(1, leer(minimoIn, 3))) : 3;
    const vals = notas.map((n) => leer(n, 0));
    vals.forEach((v, i) => {
      const d = desempeno(v, minimo);
      const celda = $(`[data-desempeno="${i}"]`, el);
      if (celda) {
        celda.dataset.d = d;
        celda.innerHTML = DESEMPENO_TEXTO[d][o.lang] + (d === 'Bajo' ? ` <small>${t('(Failed)', '(No aprobada)')}</small>` : '');
      }
    });
    if (promedio) promedio.textContent = round1(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1);
    const x = (d: keyof typeof DESEMPENO_TEXTO) => DESEMPENO_TEXTO[d][o.lang];
    if (cortes) cortes.textContent = `${x('Superior')} ≥ ${CORTES.superior.toFixed(1)} · ${x('Alto')} ≥ ${CORTES.alto.toFixed(1)} · ${x('Básico')} ≥ ${minimo.toFixed(1)} · ${x('Bajo')} < ${minimo.toFixed(1)}`;
  };
  notas.forEach((n) => n.addEventListener('input', pintar));
  minimoIn?.addEventListener('input', pintar);
  // Al salir del campo, la nota queda con un decimal, como en el producto.
  [...notas, ...(minimoIn ? [minimoIn] : [])].forEach((n) => n.addEventListener('change', () => { n.value = leer(n, 0).toFixed(1); pintar(); }));
  pintar();
}

/* ───────── design system ───────── */

function ds(el: HTMLElement) {
  const tabs = $$<HTMLButtonElement>('[data-seg-ds]', el);
  tabs.forEach((b) => b.addEventListener('click', () => activar(tabs, b)));
}

export function iniciarCampus(o: Opciones) {
  const raiz = $('#lumina-campus');
  if (!raiz) return;
  const s = $('[data-demo="sat"]', raiz); if (s) sat(s, o);
  const c = $('[data-demo="chat"]', raiz); if (c) chat(c, o);
  const b = $('[data-demo="boletin"]', raiz); if (b) boletin(b, o);
  const d = $('[data-demo="ds"]', raiz); if (d) ds(d);
}
