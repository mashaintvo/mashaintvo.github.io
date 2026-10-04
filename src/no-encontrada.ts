// La 404: solo tipografías y estilos base; nada de WebGL.
import '@fontsource-variable/manrope';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './estilos/base.css';
import './estilos/no-encontrada.css';

// Un solo idioma: el de la versión de la que venía la visita.
if (location.pathname.startsWith('/es')) {
  document.querySelector<HTMLElement>('[data-idioma="en"]')?.setAttribute('hidden', '');
  document.querySelector<HTMLElement>('[data-idioma="es"]')?.removeAttribute('hidden');
  document.documentElement.lang = 'es-CO';
  document.title = 'Página no encontrada · María Sanjuán';
}
