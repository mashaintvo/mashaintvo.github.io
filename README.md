# maría sanjuán — portafolio

Portafolio de María Alejandra Sanjuán Herrera: **Frontend AI Developer & UX/UI Designer**.
Bilingüe (inglés en `/`, español en `/es/`), con Lúmina Tech y Lúmina Campus como casos.

**En vivo:** https://mashaintvo.github.io

## Qué tiene

- Un retrato hecho de glifos de código (WebGL, three.js), con una lupa que revela la foto.
- Una coreografía de scroll con GSAP y Lenis; el contenido entra al bajar.
- Los proyectos con sus pantallas reales y sus piezas interactivas, recreadas con **datos ficticios**: el colegio de las capturas es el de demostración, todo inventado.
- WCAG 2.1 AA, `prefers-reduced-motion`, se lee completo sin JavaScript ni WebGL.

## Correr en local

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | Qué hace |
|---|---|
| `npm run build` | Compila el sitio en `dist/` |
| `npm run typecheck` | Revisa los tipos |
| `npm run cv` | Genera la hoja de vida (ES y EN) en PDF y las tarjetas para redes |
| `npm run auditoria` | Auditoría de accesibilidad (axe) y desbordes, escritorio y móvil |
| `npm run retrato` | Recorta la foto y calcula su profundidad (modelos locales) |
| `npm run monograma` | Genera el monograma en vector (hoy solo lo usa el ícono) |

## Publicación

Cada cambio en `main` se publica solo en GitHub Pages (`.github/workflows/pages.yml`).

## Stack

Vite · TypeScript · three.js · GSAP · Lenis · Manrope, Geist y Geist Mono (SIL OFL, servidas desde el sitio).
