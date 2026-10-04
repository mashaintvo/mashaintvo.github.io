/**
 * Trayectoria y conocimientos. Fuente: la hoja de vida de María
 * (CV-Maria-Alejandra-Sanjuan-ES.pdf y Resume-…-EN.pdf, sep 2026), más lo que
 * ella pidió añadir el 4 oct 2026: Angular, .NET, Docker, Storybook,
 * three.js y WebGL, GSAP, Vite, Node.js, Express y PostgreSQL.
 * Sobre Lúmina manda lo verificado en el repositorio (ver lumina-verdad).
 */

type Bi = { es: string; en: string };
const b = (es: string, en: string = es): Bi => ({ es, en });

export interface Trabajo {
  id: string;
  fechas: Bi;
  rol: Bi;
  empresa: string;
  /** solo si la hoja de vida lo dice */
  lugar?: Bi;
  logro?: Bi;
  /** ids de conocimientos que la hoja de vida asocia a este trabajo */
  usa: string[];
}

export interface Conocimiento { id: string; nombre: Bi }
export interface Grupo { id: 'codigo' | 'diseno' | 'ia' | 'calidad'; nombre: Bi; items: Conocimiento[] }

const k = (id: string, es: string, en: string = es): Conocimiento => ({ id, nombre: b(es, en) });

export const GRUPOS: Grupo[] = [
  {
    id: 'codigo', nombre: b('Código', 'Code'), items: [
      k('react', 'React'), k('angular', 'Angular'), k('vue', 'Vue'), k('ts', 'TypeScript'), k('js', 'JavaScript'),
      k('html', 'HTML5'), k('css', 'CSS3'), k('sass', 'SASS (BEM)'), k('less', 'LESS'), k('tailwind', 'Tailwind CSS'),
      k('bootstrap', 'Bootstrap'), k('rxjs', 'RxJS'), k('haml', 'HAML'), k('pug', 'Pug'), k('rest', 'APIs REST', 'REST APIs'),
      k('three', 'three.js y WebGL', 'three.js & WebGL'), k('gsap', 'GSAP'), k('vite', 'Vite'), k('node', 'Node.js'),
      k('express', 'Express'), k('postgres', 'PostgreSQL'), k('dotnet', '.NET'),
    ],
  },
  {
    id: 'diseno', nombre: b('Diseño', 'Design'), items: [
      k('figma', 'Figma'), k('photoshop', 'Photoshop'), k('zeplin', 'Zeplin'), k('antd', 'Ant Design'),
      k('responsive', 'Diseño responsive', 'Responsive design'), k('a11y', 'Accesibilidad (WCAG)', 'Accessibility (WCAG)'),
      k('ds', 'Sistemas de diseño', 'Design systems'), k('prototipado', 'Prototipado', 'Prototyping'),
      k('historias', 'Historias de usuario', 'User stories'),
    ],
  },
  {
    id: 'ia', nombre: b('IA y agentes', 'AI & agents'), items: [
      k('sdd', 'SDD (spec-driven development)'), k('multiagente', 'Flujos multiagente', 'Multi-agent flows'),
      k('looping', 'Looping'), k('prompting', 'Prompting'), k('claude', 'Claude'), k('claudecode', 'Claude Code'),
      k('cursor', 'Cursor'), k('copilot', 'Copilot'), k('mcp', 'MCP'), k('n8n', 'n8n'),
      k('bedrock', 'AWS Bedrock AgentCore'), k('figmamake', 'Figma Make'), k('antigravity', 'Antigravity'),
    ],
  },
  {
    id: 'calidad', nombre: b('Calidad y entrega', 'Quality & delivery'), items: [
      k('storybook', 'Storybook'), k('playwright', 'Playwright'), k('tests', 'Pruebas automatizadas', 'Automated testing'),
      k('git', 'Git'), k('cicd', 'CI/CD'), k('docker', 'Docker'), k('agile', 'Ágiles', 'Agile'), k('scrum', 'Scrum'),
      k('supabase', 'Supabase'), k('aws', 'AWS'), k('liderazgo', 'Liderazgo de equipos', 'Team leadership'),
      k('remoto', 'Trabajo remoto', 'Remote work'),
    ],
  },
];

export const TRABAJOS: Trabajo[] = [
  {
    id: 'interkont', fechas: b('mar 2026 — hoy', 'Mar 2026 — now'),
    rol: b('Desarrolladora front-end · orquestadora de agentes de IA', 'Front-end developer · AI agent orchestrator'),
    empresa: 'Interkont S.A.S.', lugar: b('Colombia, en remoto', 'Colombia, remote'),
    logro: b(
      'La IA multiagente bajo SDD es la metodología del equipo de punta a punta: de las historias de usuario con el cliente a la arquitectura front-end. Interfaces en React y Angular, documentadas en Storybook, con Playwright en verde en cada pull request.',
      'Multi-agent AI under SDD is the team’s end-to-end method: from user stories with the client to front-end architecture. React and Angular interfaces, documented in Storybook, with Playwright green on every pull request.',
    ),
    usa: ['react', 'angular', 'rest', 'storybook', 'playwright', 'tests', 'sdd', 'multiagente', 'looping', 'prompting', 'claude', 'historias', 'remoto'],
  },
  {
    id: 'lumina', fechas: b('ene 2026 — hoy', 'Jan 2026 — now'),
    rol: b('Fundadora y representante legal', 'Founder & legal representative'),
    empresa: 'Lúmina Tech Colombia S.A.S.', lugar: b('Bogotá', 'Bogotá'),
    logro: b(
      'Lúmina Campus, del producto a producción, con agentes de IA. Seleccionada para el Programa de Levantamiento de Capital para Startups de la Cámara de Comercio de Bogotá.',
      'Lúmina Campus, from product to production, with AI agents. Selected for the Bogotá Chamber of Commerce Startup Capital Raising Program.',
    ),
    usa: ['react', 'ts', 'tailwind', 'three', 'gsap', 'vite', 'node', 'express', 'postgres', 'supabase', 'playwright', 'tests', 'a11y', 'ds', 'figma', 'sdd', 'multiagente', 'claude', 'claudecode', 'git', 'cicd'],
  },
  {
    id: 'factech', fechas: b('feb — jun 2026', 'Feb — Jun 2026'),
    rol: b('CSS developer y diseñadora web · cliente: Teladoc Health', 'CSS developer & web designer · client: Teladoc Health'),
    empresa: 'Factech Servicios Informáticos S.L.', lugar: b('España, en remoto', 'Spain, remote'),
    logro: b('CSS avanzado y diseño de interfaces en Figma y Ant Design, con equipos globales.', 'Advanced CSS and interface design in Figma and Ant Design, with global teams.'),
    usa: ['css', 'figma', 'antd', 'remoto'],
  },
  {
    id: 'candelasoft', fechas: b('nov 2023 — feb 2026', 'Nov 2023 — Feb 2026'),
    rol: b('Líder de UX y maquetadora front-end senior', 'UX leader & senior front-end developer'),
    empresa: 'SSMC Soft — Candelasoft', lugar: b('Alemania, en remoto · Bogotá', 'Germany, remote · Bogotá'),
    logro: b('Dirección del equipo de UX/UI y de la estrategia de experiencia de todos los productos; sistemas de componentes en Storybook.', 'Led the UX/UI team and the experience strategy across all products; component systems in Storybook.'),
    usa: ['liderazgo', 'ds', 'storybook', 'sass', 'react', 'remoto'],
  },
  {
    id: 'tirant', fechas: b('feb 2022 — feb 2024', 'Feb 2022 — Feb 2024'),
    rol: b('Diseñadora y maquetadora web', 'Web designer & front-end developer'),
    empresa: 'Editorial Tirant Lo Blanch', lugar: b('España, en remoto', 'Spain, remote'),
    logro: b('Productos digitales de un grupo editorial jurídico, con Vue, HAML, Pug y Bootstrap, en equipos ágiles.', 'Digital products for a legal publishing group, with Vue, HAML, Pug and Bootstrap, in agile teams.'),
    usa: ['vue', 'haml', 'pug', 'bootstrap', 'agile', 'remoto'],
  },
  {
    id: 'fisacorp', fechas: b('mar — dic 2022', 'Mar — Dec 2022'),
    rol: b('Diseñadora UX/UI y desarrolladora front-end', 'UX/UI designer & front-end developer'),
    empresa: 'FisaCorp',
    logro: b('UX, prototipado en Figma y vistas en React, HTML5, CSS3 y Bootstrap.', 'UX, Figma prototyping and views in React, HTML5, CSS3 and Bootstrap.'),
    usa: ['figma', 'prototipado', 'react', 'html', 'css', 'bootstrap'],
  },
  {
    id: 'ilumno', fechas: b('may 2020 — dic 2021', 'May 2020 — Dec 2021'),
    rol: b('Maquetadora UX', 'UX developer'),
    empresa: 'Ilumno', lugar: b('Bogotá', 'Bogotá'),
    logro: b('Componentes en Angular y flujos con RxJS para plataformas educativas de alto tráfico, entre ellas Universidad Siglo 21 y Areandina.', 'Angular components and RxJS flows for high-traffic education platforms, among them Universidad Siglo 21 and Areandina.'),
    usa: ['angular', 'rxjs', 'sass', 'bootstrap', 'storybook'],
  },
  {
    id: 'viajemos', fechas: b('abr 2018 — abr 2020', 'Apr 2018 — Apr 2020'),
    rol: b('Diseñadora y maquetadora web', 'Web designer & front-end developer'),
    empresa: 'Viajemos.com — Browser Travel Solutions', lugar: b('Bogotá', 'Bogotá'),
    usa: ['html', 'css'],
  },
];

export const FORMACION = [
  { titulo: b('Profesional en Diseño Gráfico', 'Bachelor’s degree in Graphic Design'), donde: 'Universidad Autónoma del Caribe · Barranquilla', fechas: '2012 — 2016' },
  { titulo: b('Frontend con React.js · Escuela de Producto y Gestión de Tiempo', 'Front-end with React.js · Product & Time Management School'), donde: 'Platzi', fechas: '2024 — 2026' },
];

export const IDIOMAS = b('Español nativo · inglés de lectura técnica, mejorando activamente', 'Spanish (native) · English (reading proficiency, actively improving)');
