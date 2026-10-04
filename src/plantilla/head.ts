import { PERFIL } from '../datos/perfil';
import { idioma, ruta, type Lang } from './util';

/** <head>: título, descripción, idiomas alternos, tarjeta para redes y JSON-LD. */
export function renderHead(lang: Lang) {
  const L = idioma(lang);
  const url = PERFIL.sitio + ruta(lang);
  const title = L(
    'María Sanjuán — Frontend AI Developer & UX/UI Designer',
    'María Sanjuán — Desarrolladora front-end con IA y diseñadora UX/UI',
  );
  const description = L(
    'Portfolio of María Sanjuán, front-end developer and UX/UI designer in Bogotá. Eight years building interfaces for teams in Spain, Germany and Colombia, now with multi-agent AI. Interactive case studies: Lúmina Tech and Lúmina Campus.',
    'Portafolio de María Sanjuán, desarrolladora front-end y diseñadora UX/UI en Bogotá. Ocho años construyendo interfaces para equipos de España, Alemania y Colombia, hoy con IA multiagente. Casos interactivos: Lúmina Tech y Lúmina Campus.',
  );
  // La tarjeta para redes (1200 × 630): la generan tools/cv.mjs y og.html.
  const og = `${PERFIL.sitio}/og/maria-sanjuan-${lang}.jpg`;
  const altOg = L('María Sanjuán’s portrait drawn with lines of code, next to her name.', 'El retrato de María Sanjuán dibujado con líneas de código, junto a su nombre.');
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${PERFIL.sitio}/#maria`,
        name: PERFIL.nombreCompleto,
        alternateName: PERFIL.nombre,
        jobTitle: PERFIL.titulo,
        url: `${PERFIL.sitio}/`,
        image: og,
        email: `mailto:${PERFIL.correo}`,
        address: { '@type': 'PostalAddress', addressLocality: 'Bogotá', addressCountry: 'CO' },
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universidad Autónoma del Caribe' },
        knowsAbout: ['Front-end development', 'UX/UI design', 'Design systems', 'Web accessibility (WCAG 2.1 AA)', 'Spec-driven development with AI agents', 'React', 'Angular', 'TypeScript', 'three.js', 'Figma', 'Storybook', 'Playwright'],
        sameAs: [PERFIL.linkedin, PERFIL.github, PERFIL.behance],
      },
      {
        '@type': 'WebSite',
        '@id': `${PERFIL.sitio}/#sitio`,
        url: `${PERFIL.sitio}/`,
        name: 'María Sanjuán',
        inLanguage: lang === 'es' ? 'es-CO' : 'en',
        author: { '@id': `${PERFIL.sitio}/#maria` },
      },
    ],
  };

  return `
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="author" content="${PERFIL.nombreCompleto}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="theme-color" content="#0F0A14" />
  <meta name="color-scheme" content="dark" />
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="en" href="${PERFIL.sitio}/" />
  <link rel="alternate" hreflang="es" href="${PERFIL.sitio}/es/" />
  <link rel="alternate" hreflang="x-default" href="${PERFIL.sitio}/" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <meta property="og:type" content="profile" />
  <meta property="og:locale" content="${lang === 'es' ? 'es_CO' : 'en_US'}" />
  <meta property="og:locale:alternate" content="${lang === 'es' ? 'en_US' : 'es_CO'}" />
  <meta property="og:site_name" content="María Sanjuán" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${og}" />
  <meta property="og:image:secure_url" content="${og}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${altOg}" />
  <meta property="profile:first_name" content="María" />
  <meta property="profile:last_name" content="Sanjuán" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${og}" />
  <meta name="twitter:image:alt" content="${altOg}" />

  <script>document.documentElement.classList.remove('no-js');try{var m=localStorage.getItem('ms:modo');if(m==='diseno'||m==='codigo')document.documentElement.dataset.modo=m}catch(e){}</script>
  <noscript><style>.cargador{display:none}</style></noscript>
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>`;
}
