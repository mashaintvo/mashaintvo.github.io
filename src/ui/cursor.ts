import gsap from 'gsap';

/**
 * El puntero de María: un punto que va exacto y un aro con el degradado del
 * monograma que lo sigue con un poco de retraso. Crece sobre lo que se puede
 * tocar y, sobre los proyectos, dice qué pasa si haces clic (data-cursor).
 * Solo con ratón; con movimiento reducido, el aro no se retrasa. Es decorativo:
 * el foco del teclado sigue siendo el de siempre.
 */
export function iniciarCursor(opts: { reducido: boolean; lupa?: HTMLElement | null }) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const raiz = document.createElement('div');
  raiz.className = 'cursor';
  raiz.setAttribute('aria-hidden', 'true');
  raiz.innerHTML = '<span class="cursor__aro"><span class="cursor__texto"></span></span><span class="cursor__punto"></span>';
  document.body.append(raiz);
  document.documentElement.classList.add('cursor-propio');

  const aro = raiz.querySelector<HTMLElement>('.cursor__aro')!;
  const punto = raiz.querySelector<HTMLElement>('.cursor__punto')!;
  const texto = raiz.querySelector<HTMLElement>('.cursor__texto')!;
  const dur = opts.reducido ? 0 : 0.42;
  const ax = gsap.quickTo(aro, 'x', { duration: dur, ease: 'power3' });
  const ay = gsap.quickTo(aro, 'y', { duration: dur, ease: 'power3' });
  const px = gsap.quickSetter(punto, 'x', 'px');
  const py = gsap.quickSetter(punto, 'y', 'px');

  const tocable = 'a, button, [role="button"], label, summary, input, select, [data-cursor]';
  let estado = '';
  const poner = (nuevo: string, etiqueta = '') => {
    if (nuevo === estado && texto.textContent === etiqueta) return;
    estado = nuevo;
    raiz.dataset.estado = nuevo;
    texto.textContent = etiqueta;
  };

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    raiz.classList.add('es-visible');
    px(e.clientX); py(e.clientY); ax(e.clientX); ay(e.clientY);
    const el = (e.target as Element | null)?.closest?.(tocable) as HTMLElement | null;
    const etiqueta = el?.closest<HTMLElement>('[data-cursor]')?.dataset.cursor ?? '';
    poner(etiqueta ? 'etiqueta' : el ? 'tocable' : '', etiqueta);
    raiz.classList.toggle('en-lupa', !!opts.lupa?.classList.contains('es-visible'));
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => raiz.classList.remove('es-visible'));
  addEventListener('pointerdown', () => raiz.classList.add('es-pulsado'));
  addEventListener('pointerup', () => raiz.classList.remove('es-pulsado'));
}
