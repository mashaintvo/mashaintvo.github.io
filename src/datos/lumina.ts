/**
 * Lúmina Tech: lo que el caso enseña, copiado de su fuente (solo lectura):
 *   · paleta: manual de marca v1.0 y luminahub-web/src/style.css
 *   · coreografía: luminahub-web/src/main.ts en origin/main (con Lab → Hub)
 *   · consola: luminahub-web/src/ui/console.ts (datos ficticios)
 */

export const PALETA_LUMINA = [
  { id: 'azul-noche', nombre: { es: 'Azul noche', en: 'Night blue' }, hex: '#0D0F2B', uso: { es: 'Fondo. Nunca negro puro.', en: 'Background. Never pure black.' } },
  { id: 'indigo', nombre: { es: 'Índigo', en: 'Indigo' }, hex: '#1E1B6E', uso: { es: 'Profundidad, degradados.', en: 'Depth, gradients.' } },
  { id: 'lima', nombre: { es: 'Lima', en: 'Lime' }, hex: '#4DFF4B', uso: { es: 'Solo botón principal, palabras clave y el cuadro del símbolo.', en: 'Only the primary button, headline keywords and the symbol’s square.' } },
  { id: 'violeta', nombre: { es: 'Violeta', en: 'Violet' }, hex: '#6B68B0', uso: { es: 'Acento en superficies, no en texto pequeño.', en: 'Accent on surfaces, not small text.' } },
  { id: 'violeta-claro', nombre: { es: 'Violeta claro', en: 'Light violet' }, hex: '#A9A6E3', uso: { es: 'Existe para el texto pequeño.', en: 'Exists for small text.' } },
  { id: 'perla', nombre: { es: 'Perla', en: 'Pearl' }, hex: '#F4F4F6', uso: { es: 'Texto.', en: 'Text.' } },
] as const;

export const FONDO_LUMINA = '#0D0F2B';

/** Las cinco figuras del motor, en el orden del sitio. */
export const FORMAS_LUMINA = [
  { es: 'Símbolo', en: 'Symbol', de: { es: 'el logo', en: 'the logo' } },
  { es: 'Red neuronal', en: 'Neural network', de: { es: 'la IA', en: 'AI' } },
  { es: 'Onda', en: 'Wave', de: { es: 'Campus', en: 'Campus' } },
  { es: 'Hélice', en: 'Helix', de: { es: 'Insight', en: 'Insight' } },
  { es: 'Nudo', en: 'Knot', de: { es: 'Hub', en: 'Hub' } },
] as const;

export interface EstadoK { morph: number; x: number; y: number; scale: number; alpha: number; spin: number }

/** Estados de escritorio de cada sección (main.ts de luminahub-web). morph: 0 logo · 1 red · 2 onda · 3 hélice · 4 nudo · 5 logo. */
export const K_LUMINA: { id: string; seccion: { es: string; en: string }; k: EstadoK; codigo: string }[] = [
  { id: 'hero', seccion: { es: 'Portada', en: 'Hero' }, k: { morph: 0, x: 0.5, y: 0.3, scale: 1, alpha: 1, spin: 0 }, codigo: 'gsap.set(S, K.hero);' },
  { id: 'manifest', seccion: { es: 'Manifiesto', en: 'Manifesto' }, k: { morph: 1, x: 0.56, y: 0, scale: 1.05, alpha: 0.65, spin: 1.4 }, codigo: "seg('.manifesto', 'top bottom', 'top 15%', K.hero, K.manifest);" },
  { id: 'ai', seccion: { es: 'IA en acción', en: 'AI in action' }, k: { morph: 1, x: 0, y: 0, scale: 1.55, alpha: 0.72, spin: 2.6 }, codigo: "seg('.ai', 'top 85%', 'top 10%', K.manifest, K.ai);" },
  { id: 'campus', seccion: { es: 'Campus', en: 'Campus' }, k: { morph: 2, x: 0.5, y: 0, scale: 0.95, alpha: 1, spin: 3.4 }, codigo: 'tl.fromTo(S, { ...K.ai }, { ...K.campus, duration: 0.85 }, 0.1);' },
  { id: 'insight', seccion: { es: 'Insight', en: 'Insight' }, k: { morph: 3, x: 0.52, y: 0, scale: 0.95, alpha: 1, spin: 5.2 }, codigo: 'tl.fromTo(S, { ...K.campus }, { ...K.insight, duration: 0.8 }, 1.15);' },
  { id: 'hub', seccion: { es: 'Hub', en: 'Hub' }, k: { morph: 4, x: 0.52, y: 0, scale: 1, alpha: 1, spin: 6.6 }, codigo: 'tl.fromTo(S, { ...K.insight }, { ...K.hub, duration: 0.8 }, 2.15);' },
  { id: 'trust', seccion: { es: 'Confianza', en: 'Trust' }, k: { morph: 4, x: 0, y: 0, scale: 1.8, alpha: 0.28, spin: 8.2 }, codigo: "seg('.marquee', 'top bottom', 'bottom top', K.hub, K.trust);" },
  { id: 'contact', seccion: { es: 'Contacto', en: 'Contact' }, k: { morph: 5, x: 0.58, y: -0.22, scale: 0.85, alpha: 1, spin: Math.PI * 4 }, codigo: "seg('.contact', 'top bottom', 'top 25%', K.trust, K.contact);" },
];

/** Dónde cae cada estado en el recorrido de la página (fracción del scroll, aproximada). */
export const POSICION_K = [0, 0.11, 0.24, 0.4, 0.5, 0.6, 0.77, 0.96];

/** El guion de la consola del plan del día: la forma real de POST /ai/daily-plan, con datos ficticios. */
export interface Seg { t: string; c?: string; speed?: number; pause?: number }
export const GUION_CONSOLA: Seg[] = [
  { t: '$ ', c: 'c-p', speed: 0 },
  { t: 'lumina ai plan-del-dia --rol docente\n', c: 'c-t', speed: 26, pause: 380 },
  { t: '  ↳ contexto  3 grupos · período 2 · 128 notas\n', c: 'c-m', speed: 0, pause: 260 },
  { t: '  ↳ modelo    IA generativa · en pausa\n', c: 'c-m', speed: 0, pause: 260 },
  { t: '  ↳ generando…\n\n', c: 'c-m', speed: 0, pause: 900 },
  { t: '  ● PRIORIDAD ALTA\n', c: 'c-h', speed: 0, pause: 120 },
  { t: '    Recuperación en Matemáticas 9°B\n', c: 'c-t', speed: 14 },
  { t: '    6 estudiantes bajo 3,0: agenda un repaso de\n    fracciones antes del jueves.\n\n', speed: 9, pause: 220 },
  { t: '  ○ RECORDATORIO\n', c: 'c-n', speed: 0, pause: 120 },
  { t: '    Notas pendientes de 10°A\n', c: 'c-t', speed: 14 },
  { t: '    Faltan 12 calificaciones del taller 3 para\n    cerrar el período.\n\n', speed: 9, pause: 300 },
  { t: '  ✓ demostración · datos ficticios · función en pausa', c: 'c-ok', speed: 0 },
];

/** El mismo guion, traducido, para la versión en inglés del portafolio. */
export const GUION_CONSOLA_EN: Seg[] = [
  { t: '$ ', c: 'c-p', speed: 0 },
  { t: 'lumina ai daily-plan --role teacher\n', c: 'c-t', speed: 26, pause: 380 },
  { t: '  ↳ context   3 groups · period 2 · 128 grades\n', c: 'c-m', speed: 0, pause: 260 },
  { t: '  ↳ model     generative AI · paused\n', c: 'c-m', speed: 0, pause: 260 },
  { t: '  ↳ generating…\n\n', c: 'c-m', speed: 0, pause: 900 },
  { t: '  ● HIGH PRIORITY\n', c: 'c-h', speed: 0, pause: 120 },
  { t: '    Math recovery, grade 9B\n', c: 'c-t', speed: 14 },
  { t: '    6 students below 3.0: schedule a fractions\n    review before Thursday.\n\n', speed: 9, pause: 220 },
  { t: '  ○ REMINDER\n', c: 'c-n', speed: 0, pause: 120 },
  { t: '    Pending grades, grade 10A\n', c: 'c-t', speed: 14 },
  { t: '    12 grades from worksheet 3 are missing to\n    close the period.\n\n', speed: 9, pause: 300 },
  { t: '  ✓ demo · fictitious data · feature paused', c: 'c-ok', speed: 0 },
];

export const guionConsola = (lang: 'es' | 'en') => (lang === 'es' ? GUION_CONSOLA : GUION_CONSOLA_EN);
