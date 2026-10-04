/**
 * Lúmina Campus: reglas y tokens copiados de su código (rama origin/master,
 * 4 oct 2026; solo lectura). Las demos los reproducen con DATOS FICTICIOS:
 * ningún colegio, estudiante ni menor real.
 *   · SAT: apps/api/src/features/sat/sat.service.ts
 *   · chat: apps/api/src/features/chat/chat.service.ts (matriz y modo supervisor)
 *   · boletín: apps/api/src/shared/siee/calculo.ts
 *   · design system: apps/web/src/index.css
 * Los textos en español son los del producto; en la versión en inglés del
 * portafolio van traducidos (la lógica y los números no cambian).
 */

export type Lang = 'es' | 'en';
type Texto = { es: string; en: string };

/* ───────── SAT (Sistema de Alerta Temprana) ───────── */

export const ASISTENCIA_ROJO = 75; // %
export const ASISTENCIA_AMARILLO = 85; // %
export const CAIDA_TENDENCIA = 0.5;

/** Claves internas (el CSS pinta el semáforo con ellas); lo que se lee va en NIVEL_TEXTO. */
export type Nivel = 'ROJO' | 'AMARILLO' | 'VERDE' | 'SIN_DATOS';
export const NIVEL_TEXTO: Record<Nivel, Texto> = {
  ROJO: { es: 'ROJO', en: 'RED' },
  AMARILLO: { es: 'AMARILLO', en: 'YELLOW' },
  VERDE: { es: 'VERDE', en: 'GREEN' },
  SIN_DATOS: { es: 'SIN DATOS', en: 'NO DATA' },
};

/** La misma lógica que evaluarEstudiante(), con sus mismos textos de motivo (traducidos en inglés). */
export function evaluarSat(e: { promedio: number | null; asistencia: number | null; tendencia: number | null; minimo: number }, lang: Lang = 'es') {
  if (e.promedio === null && e.asistencia === null) return { nivel: 'SIN_DATOS' as Nivel, motivos: [] as string[] };
  const es = lang === 'es';
  const motivos: string[] = [];
  let nivel: Nivel = 'VERDE';
  if (e.asistencia !== null && e.asistencia < ASISTENCIA_ROJO) {
    nivel = 'ROJO';
    motivos.push(es ? `Asistencia ${e.asistencia}% (crítico: menos de ${ASISTENCIA_ROJO}%)` : `Attendance ${e.asistencia}% (critical: below ${ASISTENCIA_ROJO}%)`);
  }
  if (e.promedio !== null && e.promedio < e.minimo) {
    nivel = 'ROJO';
    motivos.push(es ? `Promedio ${e.promedio.toFixed(1)} (mínimo aprobatorio ${e.minimo.toFixed(1)})` : `Average ${e.promedio.toFixed(1)} (passing minimum ${e.minimo.toFixed(1)})`);
  }
  if (nivel !== 'ROJO') {
    if (e.asistencia !== null && e.asistencia < ASISTENCIA_AMARILLO) {
      nivel = 'AMARILLO';
      motivos.push(es ? `Asistencia ${e.asistencia}% (en observación: menos de ${ASISTENCIA_AMARILLO}%)` : `Attendance ${e.asistencia}% (under watch: below ${ASISTENCIA_AMARILLO}%)`);
    }
    if (e.tendencia !== null && e.tendencia <= -CAIDA_TENDENCIA) {
      nivel = 'AMARILLO';
      motivos.push(es ? `Tendencia negativa entre períodos: ${e.tendencia.toFixed(1)}` : `Negative trend between periods: ${e.tendencia.toFixed(1)}`);
    }
  }
  return { nivel, motivos };
}

/** Los tres estudiantes ficticios que también usa luminahub.com.co. */
export const PRESETS_SAT = [
  { id: '07', nombre: { es: 'Estudiante 07 · 9°B', en: 'Student 07 · Grade 9B' }, promedio: 2.6, asistencia: 72, tendencia: -0.3 },
  { id: '14', nombre: { es: 'Estudiante 14 · 9°B', en: 'Student 14 · Grade 9B' }, promedio: 3.6, asistencia: 91, tendencia: -0.8 },
  { id: '22', nombre: { es: 'Estudiante 22 · 9°B', en: 'Student 22 · Grade 9B' }, promedio: 4.2, asistencia: 96, tendencia: 0.2 },
] as const;

/* ───────── chat: quién puede escribirle a quién ───────── */

export type Rol = 'admin' | 'teacher' | 'student' | 'parent';
export const NOMBRE_ROL: Record<Rol, Texto> = {
  admin: { es: 'Directivo', en: 'Leadership' },
  teacher: { es: 'Docente', en: 'Teacher' },
  student: { es: 'Estudiante', en: 'Student' },
  parent: { es: 'Acudiente', en: 'Parent' },
};

/** Un colegio de mentira, en pequeño. Adultos con nombres del colegio de demostración; menores, solo con número. */
export interface Contacto { id: string; nombre: Texto; rol: Rol; detalle: Texto; grupo?: string; hijoDe?: string; dictaEn?: string[] }

const igual = (s: string): Texto => ({ es: s, en: s });

export const DIRECTORIO: Contacto[] = [
  { id: 'rectora', nombre: igual('Gloria Navarro'), rol: 'admin', detalle: { es: 'Rectora', en: 'Principal' } },
  { id: 'coord', nombre: igual('Diana Rojas'), rol: 'admin', detalle: { es: 'Coordinadora', en: 'Coordinator' } },
  { id: 'alvaro', nombre: igual('Álvaro Restrepo'), rol: 'teacher', detalle: { es: 'Docente de Matemáticas · 9°A', en: 'Math teacher · Grade 9A' }, dictaEn: ['9A'] },
  { id: 'nubia', nombre: igual('Nubia Castaño'), rol: 'teacher', detalle: { es: 'Docente de Lengua Castellana · 5°A', en: 'Spanish teacher · Grade 5A' }, dictaEn: ['5A'] },
  { id: 'e07', nombre: { es: 'Estudiante 07', en: 'Student 07' }, rol: 'student', detalle: { es: '9°A', en: 'Grade 9A' }, grupo: '9A' },
  { id: 'e12', nombre: { es: 'Estudiante 12', en: 'Student 12' }, rol: 'student', detalle: { es: '9°A', en: 'Grade 9A' }, grupo: '9A' },
  { id: 'e31', nombre: { es: 'Estudiante 31', en: 'Student 31' }, rol: 'student', detalle: { es: '5°A', en: 'Grade 5A' }, grupo: '5A' },
  { id: 'a07', nombre: { es: 'Acudiente de Estudiante 07', en: 'Parent of Student 07' }, rol: 'parent', detalle: { es: '9°A', en: 'Grade 9A' }, hijoDe: 'e07' },
  { id: 'a31', nombre: { es: 'Acudiente de Estudiante 31', en: 'Parent of Student 31' }, rol: 'parent', detalle: { es: '5°A', en: 'Grade 5A' }, hijoDe: 'e31' },
];

/** Desde qué persona se mira el directorio en cada rol. */
export const YO: Record<Rol, string> = { admin: 'coord', teacher: 'alvaro', student: 'e07', parent: 'a07' };

const por = (id: string) => DIRECTORIO.find((c) => c.id === id)!;

/**
 * La matriz de chat.service.ts:
 *   admin   → todos los roles de su institución
 *   teacher → admins, docentes, estudiantes de sus grupos y acudientes de esos estudiantes
 *   student → admins y sus docentes
 *   parent  → admins y docentes de los grupos de sus hijos
 *   student ↔ student: deshabilitado hasta que exista el interruptor del colegio
 */
export function puedeEscribir(yoId: string, aId: string): { si: boolean; porque: Texto } {
  const yo = por(yoId), a = por(aId);
  const no = (es: string, en: string) => ({ si: false, porque: { es, en } });
  const si = (es: string, en: string) => ({ si: true, porque: { es, en } });
  if (yo.rol === 'admin') return si('La rectoría y la coordinación escriben a todos.', 'Leadership can write to everyone.');
  if (a.rol === 'admin') return si('Todos pueden escribirle a la rectoría.', 'Everyone can write to leadership.');
  if (yo.rol === 'teacher') {
    if (a.rol === 'teacher') return si('Entre docentes, sí.', 'Teachers can write to each other.');
    if (a.rol === 'student') return yo.dictaEn?.includes(a.grupo!) ? si('Es estudiante de uno de sus grupos.', 'A student in one of their groups.') : no('No es estudiante de sus grupos.', 'Not a student in their groups.');
    if (a.rol === 'parent') return yo.dictaEn?.includes(por(a.hijoDe!).grupo!) ? si('Es acudiente de un estudiante suyo.', 'Parent of one of their students.') : no('No es acudiente de sus estudiantes.', 'Not a parent of their students.');
  }
  if (yo.rol === 'student') {
    if (a.rol === 'teacher') return a.dictaEn?.includes(yo.grupo!) ? si('Es su docente.', 'Their teacher.') : no('No es su docente.', 'Not their teacher.');
    if (a.rol === 'student') return no('Entre estudiantes no, por ahora: falta el interruptor del colegio.', 'Student to student is off for now: the school switch doesn’t exist yet.');
    return no('Un estudiante no escribe a acudientes.', 'Students don’t write to parents.');
  }
  if (yo.rol === 'parent') {
    if (a.rol === 'teacher') return a.dictaEn?.includes(por(yo.hijoDe!).grupo!) ? si('Es docente de su hijo.', 'Their child’s teacher.') : no('No es docente de su hijo.', 'Not their child’s teacher.');
    if (a.rol === 'student') return no('Un acudiente no escribe a estudiantes.', 'Parents don’t write to students.');
    return no('Entre acudientes, no.', 'Parents don’t write to each other.');
  }
  return no('No permitido.', 'Not allowed.');
}

/** Textos reales del producto (en inglés, traducidos). */
export const TEXTO_403: Texto = {
  es: 'No tienes permiso para iniciar una conversación con este usuario',
  en: 'You don’t have permission to start a conversation with this user',
};
export const TEXTO_SUPERVISOR_403: Texto = {
  es: 'Esta conversación es de tu estudiante y solo puedes leerla. Para hablar con el docente, abre tu propia conversación con él.',
  en: 'This conversation belongs to your student and you can only read it. To talk to the teacher, open your own conversation with them.',
};
export const AVISO_ESTUDIANTE: Record<Lang, { fuerte: string; resto: string }> = {
  es: { fuerte: 'Tu acudiente puede leer estos mensajes.', resto: 'Tu colegio tiene activada la protección de menores. Si necesitas contar algo en privado, habla con rectoría, orientación o tu docente en persona.' },
  en: { fuerte: 'Your parent can read these messages.', resto: 'Your school has minor protection turned on. If you need to share something privately, talk to the principal’s office, counseling or your teacher in person.' },
};

/** Una conversación ficticia entre Estudiante 07 y su docente, para el modo supervisor. */
export const CONVERSACION = [
  { de: 'e07', texto: { es: 'Profe, ¿el taller 3 se entrega el jueves?', en: 'Teacher, is worksheet 3 due on Thursday?' } },
  { de: 'alvaro', texto: { es: 'Sí, el jueves. Si te falta el punto 4, lo vemos en el repaso del martes.', en: 'Yes, on Thursday. If you’re missing item 4, we’ll go over it in Tuesday’s review.' } },
  { de: 'e07', texto: { es: 'Listo, gracias.', en: 'Got it, thanks.' } },
];

/* ───────── boletín (Decreto 1290) ───────── */

export const CORTES = { superior: 4.6, alto: 4.0 } as const;
/** Claves internas (el CSS colorea con ellas); lo que se lee va en DESEMPENO_TEXTO. */
export type Desempeno = 'Superior' | 'Alto' | 'Básico' | 'Bajo';
export const DESEMPENO_TEXTO: Record<Desempeno, Texto> = {
  Superior: { es: 'Superior', en: 'Superior' },
  Alto: { es: 'Alto', en: 'High' },
  Básico: { es: 'Básico', en: 'Basic' },
  Bajo: { es: 'Bajo', en: 'Low' },
};

/** Básico cae en la nota mínima del colegio: es el desempeño de quien aprueba raspando. */
export function desempeno(nota: number, minimo: number): Desempeno {
  if (nota >= CORTES.superior) return 'Superior';
  if (nota >= CORTES.alto) return 'Alto';
  if (nota >= minimo) return 'Básico';
  return 'Bajo';
}

/** Un decimal, con la mitad hacia afuera del cero, como ROUND(numeric, 1) en Postgres. */
export function round1(n: number) {
  const e = n * 10;
  const s = e < 0 ? -1 : 1;
  return (s * Math.round(Math.abs(e) + 1e-9)) / 10;
}

/** Ocho asignaturas del colegio de demostración y notas ficticias. */
export const BOLETIN = [
  { asignatura: { es: 'Matemáticas', en: 'Mathematics' }, docente: 'Álvaro Restrepo', nota: 2.8 },
  { asignatura: { es: 'Lengua Castellana', en: 'Spanish Language' }, docente: 'Nubia Castaño', nota: 4.1 },
  { asignatura: { es: 'Inglés', en: 'English' }, docente: 'Yaneth Palacios', nota: 3.6 },
  { asignatura: { es: 'Ciencias Naturales', en: 'Natural Sciences' }, docente: 'Jairo Molina', nota: 4.7 },
  { asignatura: { es: 'Ciencias Sociales', en: 'Social Studies' }, docente: 'Nubia Castaño', nota: 3.9 },
  { asignatura: { es: 'Educación Física', en: 'Physical Education' }, docente: 'Jairo Molina', nota: 4.5 },
  { asignatura: { es: 'Educación Artística', en: 'Art' }, docente: 'Yaneth Palacios', nota: 4.0 },
  { asignatura: { es: 'Ética y Valores', en: 'Ethics and Values' }, docente: 'Álvaro Restrepo', nota: 3.2 },
] as const;

/* ───────── design system ───────── */

export const TOKENS_CAMPUS = [
  { token: 'pizarra-profunda', hex: '#1C2B35', uso: { es: 'Barra lateral, foco', en: 'Sidebar, focus' } },
  { token: 'coral-cta', hex: '#C93C3C', uso: { es: 'Acción principal y error', en: 'Primary action and error' } },
  { token: 'celeste-pizarra', hex: '#8BB8C8', uso: { es: 'Bordes, sub-roles', en: 'Borders, sub-roles' } },
  { token: 'niebla-polar', hex: '#F5F9FB', uso: { es: 'Fondo de página', en: 'Page background' } },
  { token: 'verde-texto', hex: '#177A49', uso: { es: 'Correcto', en: 'Valid' } },
  { token: 'ambar-texto', hex: '#9A6603', uso: { es: 'Alerta', en: 'Warning' } },
] as const;
