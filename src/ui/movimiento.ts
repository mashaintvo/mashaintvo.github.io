import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * El contenido también se mueve al bajar, no solo el fondo:
 *  · data-anim="cascada"  sus hijos entran escalonados, desde abajo y un poco girados
 *  · data-escala           la portada de un proyecto crece hasta su tamaño al llegar
 *  · data-horizontal       el recorrido de pantallas se fija y se desliza de lado (escritorio)
 *  · data-contar           las cifras cuentan desde cero
 *  · .movil                los celulares suben a velocidades distintas
 * Con movimiento reducido, todo queda quieto y en su sitio.
 */
export function iniciarMovimiento(o: { reducido: boolean }) {
  if (o.reducido) return;
  const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));

  // Cascadas: cada tanda de hijos que entra junta, entra escalonada.
  $$('[data-anim="cascada"]').forEach((lista) => {
    const hijos = Array.from(lista.children) as HTMLElement[];
    gsap.set(hijos, { y: 64, opacity: 0, rotate: 1.2, scale: 0.97, transformOrigin: '0% 100%' });
    ScrollTrigger.batch(hijos, {
      start: 'top 90%',
      once: true,
      onEnter: (tanda) => gsap.to(tanda, { y: 0, opacity: 1, rotate: 0, scale: 1, duration: 1.15, stagger: 0.09, ease: 'expo.out', overwrite: true }),
    });
  });

  // La portada de cada proyecto: crece al llegar (la captura se ve entera, sin recortes).
  $$('[data-escala]').forEach((fig) => {
    gsap.fromTo(fig, { scale: 0.86, y: 40 }, {
      scale: 1, y: 0, ease: 'none',
      scrollTrigger: { trigger: fig, start: 'top bottom', end: 'top 25%', scrub: true },
    });
  });

  // Los celulares: suben a distinta velocidad.
  $$('.moviles__fila').forEach((fila) => {
    $$('.movil', fila).forEach((m, i) => {
      gsap.fromTo(m, { yPercent: 10 + (i % 2) * 14 }, { yPercent: -4 - (i % 2) * 8, ease: 'none', scrollTrigger: { trigger: fila, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  // Cifras que cuentan.
  $$('[data-contar]').forEach((el) => {
    const fin = Number(el.dataset.contar);
    const mas = el.hasAttribute('data-mas') ? '+' : '';
    const v = { n: 0 };
    el.textContent = `0${mas}`;
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(v, { n: fin, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = `${Math.round(v.n)}${mas}`; } }),
    });
  });

  // El recorrido: en escritorio se fija y desliza la fila de pantallas de lado.
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const html = document.documentElement;
    html.classList.add('con-horizontal');
    $$('[data-horizontal]').forEach((rec) => {
      const pista = rec.querySelector<HTMLElement>('.recorrido__pista');
      if (!pista) return;
      const distancia = () => Math.max(0, pista.scrollWidth - rec.clientWidth);
      const desliz = gsap.to(pista, {
        x: () => -distancia(),
        ease: 'none',
        scrollTrigger: {
          trigger: rec,
          start: 'center center',
          end: () => `+=${distancia()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      // Cada pantalla se endereza al pasar por el centro.
      $$('.recorrido__item', pista).forEach((item) => {
        gsap.fromTo(item, { rotate: 2.5, y: 30 }, {
          rotate: 0, y: 0, ease: 'none',
          scrollTrigger: { trigger: item, containerAnimation: desliz, start: 'left 95%', end: 'left 45%', scrub: true },
        });
      });
    });
    return () => html.classList.remove('con-horizontal');
  });
}

/** Pestañas accesibles (flechas, Inicio y Fin), con la entrada del panel. */
export function iniciarPestanas(o: { reducido: boolean }) {
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((caja) => {
    const tabs = Array.from(caja.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const paneles = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls') ?? '')).filter(Boolean) as HTMLElement[];
    const elegir = (i: number, foco = false) => {
      tabs.forEach((t, k) => {
        const si = k === i;
        t.setAttribute('aria-selected', String(si));
        t.tabIndex = si ? 0 : -1;
        paneles[k].hidden = !si;
      });
      if (foco) tabs[i].focus();
      if (!o.reducido) gsap.fromTo(paneles[i], { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' });
      ScrollTrigger.refresh();
    };
    // Sin JavaScript se ven todos los paneles; con él, uno a la vez.
    paneles.forEach((p, k) => { p.hidden = k !== 0; p.tabIndex = 0; });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => elegir(i));
      t.addEventListener('keydown', (e) => {
        const n = tabs.length;
        const destino = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
        if (destino < 0) return;
        e.preventDefault();
        elegir(destino, true);
      });
    });
  });
}

/** El visor: cualquier [data-ampliar] abre su pantalla en grande. */
export function iniciarVisor() {
  const visor = document.querySelector<HTMLDialogElement>('[data-visor]');
  const img = visor?.querySelector<HTMLImageElement>('[data-visor-img]');
  if (!visor || !img || typeof visor.showModal !== 'function') return;
  document.addEventListener('click', (e) => {
    const b = (e.target as Element | null)?.closest<HTMLElement>('[data-ampliar]');
    if (!b) return;
    img.src = b.dataset.ampliar ?? '';
    img.alt = b.dataset.ampliarAlt ?? '';
    visor.showModal();
  });
  // Clic fuera de la imagen: cierra.
  visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });
}
