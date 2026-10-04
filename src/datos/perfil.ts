/**
 * Datos de contacto y perfiles. Vienen de la hoja de vida de María
 * (CV-Maria-Alejandra-Sanjuan-ES.pdf, sep 2026) y de sus respuestas.
 */
export const PERFIL = {
  nombre: 'María Sanjuán',
  nombreCompleto: 'María Alejandra Sanjuán Herrera',
  titulo: 'Frontend AI Developer & UX/UI Designer',
  correo: 'marialeja0314@gmail.com',
  whatsapp: '573167855891',
  whatsappVisible: '+57 316 785 5891',
  linkedin: 'https://www.linkedin.com/in/msanjuanherrera/',
  github: 'https://github.com/mashaintvo',
  behance: 'https://www.behance.net/mashiverse',
  sitio: 'https://mashaintvo.github.io',
} as const;

/**
 * El código con el que está hecho el retrato: cada fila de glifos es un trozo
 * de este texto. Es su forma de trabajar, escrita como programa.
 */
export const CODIGO_RETRATO = `const maria = { roles: ['Frontend AI Developer', 'UX/UI Designer'], city: 'Bogotá', remote: true, since: 2018 };
export async function build(idea) {
  const spec = await specify(idea, { users: 'real', law: 'Colombian' });
  const ui = design(spec, { tool: 'Figma', a11y: 'WCAG 2.1 AA', motion: 'with intent' });
  return agents(spec).implement(ui).verify({ e2e: 'Playwright', ci: 'green' }).reviewWithPeople();
}
// two roles, one signature`;

/** El mismo programa, en español, para la versión en español. */
export const CODIGO_RETRATO_ES = `const maria = { roles: ['Desarrolladora front-end con IA', 'Diseñadora UX/UI'], ciudad: 'Bogotá', remoto: true, desde: 2018 };
export async function construir(idea) {
  const spec = await especificar(idea, { usuarios: 'reales', ley: 'colombiana' });
  const ui = diseñar(spec, { herramienta: 'Figma', a11y: 'WCAG 2.1 AA', movimiento: 'con intención' });
  return agentes(spec).implementar(ui).verificar({ e2e: 'Playwright', ci: 'en verde' }).revisarConPersonas();
}
// dos roles, una firma`;
